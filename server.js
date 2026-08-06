'use strict';

const express   = require('express');
const path      = require('path');
const https     = require('https');
const crypto    = require('crypto');
const fs        = require('fs');
const rateLimit = require('express-rate-limit');

const PORT = process.env.PORT || 3000;
const app  = express();

// Render terminates TLS and proxies to this app — without this, express-rate-limit
// (and anything else keying off req.ip) sees Render's proxy IP for every visitor,
// not the real client IP.
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
// No framework middleware (e.g. helmet) was in use; these are the baseline
// headers for a site with no inline-script requirements beyond GA4/Formspree.
// HSTS is intentionally NOT set here — Render's edge terminates TLS in front
// of this app and is the more correct place to enforce it.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://formspree.io",
      "frame-ancestors 'none'",
      "form-action 'self' https://formspree.io",
      "base-uri 'self'",
    ].join('; ')
  );
  next();
});

// ── Rate limiting on sensitive endpoints ──────────────────────────────────────
// /api/verify, /api/verify-course, and /api/download were previously
// unthrottled. This is a starting-point threshold, not tuned against real
// traffic — revisit post-launch.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  // The test suite legitimately fires far more than 30 requests at these
  // routes in quick succession; Jest sets NODE_ENV=test by default, so skip
  // throttling there rather than making tests fight the limiter.
  skip: () => process.env.NODE_ENV === 'test',
});

// ── Protected files ───────────────────────────────────────────────────────────
// BA template .docx and bundle .zip are only served via /api/download.
// This middleware must come before express.static().
const PROTECTED = /^\/assets\/downloads\/(ba-template-[^/]+\.docx|ba-templates-bundle\.zip|ai-prompts-library-(starter|complete)\.pdf)$/;

app.use((req, res, next) => {
  if (PROTECTED.test(req.path)) {
    return res.status(403).json({ error: 'Purchase required.' });
  }
  next();
});

// ── Hidden server internals ───────────────────────────────────────────────────
// express.static() below serves the whole repo root, which is also where
// server.js, package.json/package-lock.json, tests/, and (once `npm install`
// runs at deploy time per render.yaml) node_modules/ all live. None of that
// is meant to be public — only the HTML pages and assets/ are. Block it here,
// before express.static(), with a plain 404 so a probe can't tell the
// difference between "doesn't exist" and "exists but hidden".
const HIDDEN_ROOT_FILES = new Set(['/server.js', '/package.json', '/package-lock.json', '/render.yaml']);
const HIDDEN_ROOT_DIRS  = /^\/(node_modules|tests)(\/|$)/;

app.use((req, res, next) => {
  if (HIDDEN_ROOT_FILES.has(req.path) || HIDDEN_ROOT_DIRS.test(req.path)) {
    return res.status(404).send('Not found.');
  }
  next();
});

// ── Course registry ────────────────────────────────────────────────────────────
// Online Academy courses. Sold individually at a single fixed price via one
// Stripe Payment Link + client_reference_id, same pattern as the templates.
const COURSE_MAP = {
  'course-01': 'Requirements Engineering Fundamentals',
  'course-02': 'Requirements Gathering & Elicitation Techniques',
  'course-03': 'Stakeholder Management & Communication',
  'course-04': 'BRDs & FRDs: Writing Effective Requirements Documents',
  'course-05': 'User Stories & Use Cases for Business Analysts',
  'course-06': 'Process Mapping, BPMN & UML Fundamentals',
  'course-07': 'Agile & Scrum Foundations for Business Analysts',
  'course-08': 'Scrum Ceremonies, Backlog & Kanban',
  'course-09': 'SQL Basics & Power BI for Business Analysts',
  'course-10': 'Strategy Analysis & BA Career Readiness',
};

// Every course has a working SCORM package, but only these have a finished,
// narrated video produced from it. Purchase is gated on this set (not just
// hidden client-side) so a hand-crafted checkout link can't buy a course
// that isn't actually ready yet. Add a slug here once its video is built.
const COURSE_AVAILABLE = new Set(['course-01', 'course-07']);

// Course files live outside the public static tree (assets/courses-src, not
// /courses) so express.static() never serves them directly — the routes below
// are the only path to this content, and they require a valid access cookie.
const COURSES_DIR = path.join(__dirname, 'assets', 'courses-src');

// Course access is a long-lived cookie (not the 24h download token used for
// templates) because a course is a multi-file app the buyer revisits
// indefinitely, not a one-time file download. 400 days is the browser cap on
// Set-Cookie Max-Age (Chrome), so it's the longest a "lifetime" grant can be.
const COURSE_TOKEN_TTL    = 400 * 24 * 60 * 60 * 1000;
const courseTokens        = new Map(); // token -> { slug, expiresAt }
const courseSessionIndex  = new Map(); // session_id -> token

setInterval(() => {
  const now = Date.now();
  for (const [t, d] of courseTokens)       if (d.expiresAt < now) courseTokens.delete(t);
  for (const [s, t] of courseSessionIndex) if (!courseTokens.has(t)) courseSessionIndex.delete(s);
}, 60 * 60 * 1000).unref();

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

const COURSE_CONTENT_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css':  'text/css; charset=UTF-8',
  '.js':   'application/javascript; charset=UTF-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.xml':  'application/xml',
};

// ── GET /courses/:slug ────────────────────────────────────────────────────────
app.get('/courses/:slug', (req, res) => {
  res.redirect(`/courses/${req.params.slug}/index.html`);
});

// ── GET /courses/:slug/* ──────────────────────────────────────────────────────
// Serves a purchased course's files. Registered before express.static() so it
// fully owns the /courses/ URL space; static never gets a chance to see these
// requests (and there's no folder named "courses" in the static root anyway).
app.get('/courses/:slug/*', (req, res) => {
  const { slug } = req.params;

  if (!COURSE_MAP[slug]) {
    return res.status(404).send('Course not found.');
  }

  const cookies = parseCookies(req.headers.cookie);
  const token   = cookies[`course_${slug}`];
  const entry   = token && courseTokens.get(token);

  if (!entry || entry.expiresAt < Date.now() || entry.slug !== slug) {
    return res.redirect(`/academy.html?locked=${encodeURIComponent(slug)}`);
  }

  const courseDir = path.join(COURSES_DIR, slug);
  const relPath   = req.params[0] || 'index.html';
  const filePath  = path.normalize(path.join(courseDir, relPath));
  const relative  = path.relative(courseDir, filePath);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return res.status(400).send('Invalid path.');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).send('File not found.');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', COURSE_CONTENT_TYPES[ext] || 'application/octet-stream');
  const stream = fs.createReadStream(filePath);
  // Without this, a read error after the existsSync/statSync check above
  // (file removed/locked in the moment between check and open) would emit an
  // unhandled 'error' on the stream and crash the whole process for every
  // user, not just this request.
  stream.on('error', (err) => {
    console.error('Course file stream error:', err.message);
    if (!res.headersSent) res.status(500).send('Unable to read file.');
    else res.destroy();
  });
  stream.pipe(res);
});

// Static files
app.use(express.static(path.join(__dirname)));

// ── Template registry ─────────────────────────────────────────────────────────
const TEMPLATE_MAP = {
  'brd':                  'ba-template-brd.docx',
  'frs':                  'ba-template-frs.docx',
  'user-stories':         'ba-template-user-stories.docx',
  'process-mapping':      'ba-template-process-mapping.docx',
  'risk-register':        'ba-template-risk-register.docx',
  'stakeholder-register': 'ba-template-stakeholder-register.docx',
  'rtm':                  'ba-template-rtm.docx',
  'rfp':                  'ba-template-rfp.docx',
  'project-charter':      'ba-template-project-charter.docx',
  'test-case':            'ba-template-test-case.docx',
  'bundle':               'ba-templates-bundle.zip',
  // AI Prompt Library
  'ai-starter':           'ai-prompts-library-starter.pdf',
  'ai-complete':          'ai-prompts-library-complete.pdf',
};

const TEMPLATE_NAMES = {
  'brd':                  'Business Requirements Document',
  'frs':                  'Functional Requirements Specification',
  'user-stories':         'User Stories Template',
  'process-mapping':      'Process Mapping Templates',
  'risk-register':        'Risk Register',
  'stakeholder-register': 'Stakeholder Register',
  'rtm':                  'Requirements Traceability Matrix',
  'rfp':                  'RFP Template',
  'project-charter':      'Project Charter',
  'test-case':            'Test Case Template',
  // AI Prompt Library
  'ai-starter':           'AI Prompt Library, Starter Pack (210 Prompts)',
  'ai-complete':          'AI Prompt Library, Complete Edition (500 Prompts)',
};

const DOWNLOADS_DIR = path.join(__dirname, 'assets', 'downloads');

// ── Token store ───────────────────────────────────────────────────────────────
// token  → { template: string, expiresAt: number }
// session → token  (so the same session always gets the same token within its TTL)
const tokens       = new Map();
const sessionIndex = new Map();
const TOKEN_TTL    = 24 * 60 * 60 * 1000; // 24 h

setInterval(() => {
  const now = Date.now();
  for (const [t, d] of tokens)       if (d.expiresAt < now) tokens.delete(t);
  for (const [s, t] of sessionIndex) if (!tokens.has(t))    sessionIndex.delete(s);
}, 60 * 60 * 1000).unref();

function issueToken(template) {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, { template, expiresAt: Date.now() + TOKEN_TTL });
  return token;
}

// ── Stripe helper ─────────────────────────────────────────────────────────────
function stripeGet(apiPath) {
  return new Promise((resolve, reject) => {
    const key  = process.env.STRIPE_SECRET_KEY || '';
    const auth = Buffer.from(key + ':').toString('base64');
    // AbortController rather than the legacy `timeout` socket option — the
    // latter altered low-level socket setup enough to introduce a rare race
    // with nock's mock sockets in the test suite (intermittent unhandled
    // "socket hang up" on unrelated nock.replyWithError() cases). This is the
    // modern, better-supported way to bound an outbound request's lifetime
    // and doesn't touch socket-level timing at all.
    // Without this, a Stripe API hang (no response, no socket error) would
    // leave the request pending forever instead of failing over to the
    // generic 502 error path below.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const req  = https.request(
      { hostname: 'api.stripe.com', path: apiPath, method: 'GET',
        headers: { Authorization: `Basic ${auth}` },
        signal: controller.signal },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          clearTimeout(timer);
          try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
          catch (e) { reject(e); }
        });
      }
    );
    req.on('error', (err) => {
      clearTimeout(timer);
      reject(err.name === 'AbortError' ? new Error('Stripe request timed out') : err);
    });
    req.end();
  });
}

// ── GET /api/verify?session_id=cs_xxx ────────────────────────────────────────
// Verifies a completed Stripe checkout session and returns a download token.
// The same session always returns the same token within its 24-hour window.
app.get('/api/verify', apiLimiter, async (req, res) => {
  const { session_id } = req.query;

  if (!session_id || !String(session_id).startsWith('cs_')) {
    return res.status(400).json({ error: 'Invalid session.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment verification is temporarily unavailable. Please contact info@lbsconnect.net.' });
  }

  // Return existing token if still valid
  const existing = sessionIndex.get(session_id);
  if (existing && tokens.has(existing)) {
    const e = tokens.get(existing);
    if (e.expiresAt > Date.now()) {
      const isPack = e.template === 'bundle' ? 'bundle' : 'individual';
      return res.json({
        pack: isPack,
        template: e.template,
        templateName: e.template === 'bundle' ? 'Full Bundle — All 10 Templates' : TEMPLATE_NAMES[e.template],
        token: existing,
      });
    }
  }

  // Verify with Stripe
  try {
    const { status, data } = await stripeGet(
      `/v1/checkout/sessions/${encodeURIComponent(session_id)}`
    );

    if (status !== 200) {
      return res.status(400).json({ error: 'Purchase session not found.' });
    }

    if (data.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment has not been completed.' });
    }

    const ref = String(data.client_reference_id || '').toLowerCase().trim();

    let template;
    if (ref === 'bundle') {
      template = 'bundle';
    } else if (TEMPLATE_MAP[ref]) {
      template = ref;
    } else {
      return res.status(400).json({
        error: 'We could not determine which template you purchased. Please contact info@lbsconnect.net with your receipt.',
      });
    }

    const token = issueToken(template);
    sessionIndex.set(session_id, token);

    return res.json({
      pack: template === 'bundle' ? 'bundle' : 'individual',
      template,
      templateName: template === 'bundle' ? 'Full Bundle — All 10 Templates' : TEMPLATE_NAMES[template],
      token,
    });
  } catch (err) {
    console.error('Stripe verify error:', err.message);
    return res.status(502).json({ error: 'Verification failed. Please refresh the page or contact info@lbsconnect.net.' });
  }
});

// ── GET /api/verify-course?session_id=cs_xxx ─────────────────────────────────
// Verifies a completed Stripe checkout session for a course purchase and
// grants long-lived cookie access to /courses/<slug>/ (see COURSE_TOKEN_TTL).
app.get('/api/verify-course', apiLimiter, async (req, res) => {
  const { session_id } = req.query;

  if (!session_id || !String(session_id).startsWith('cs_')) {
    return res.status(400).json({ error: 'Invalid session.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment verification is temporarily unavailable. Please contact info@lbsconnect.net.' });
  }

  function grantAccess(slug, token) {
    res.cookie(`course_${slug}`, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: COURSE_TOKEN_TTL,
      path: `/courses/${slug}`,
    });
    return res.json({ ok: true, slug, courseName: COURSE_MAP[slug] });
  }

  // Return existing token if still valid
  const existing = courseSessionIndex.get(session_id);
  if (existing && courseTokens.has(existing)) {
    const e = courseTokens.get(existing);
    if (e.expiresAt > Date.now()) {
      return grantAccess(e.slug, existing);
    }
  }

  try {
    const { status, data } = await stripeGet(
      `/v1/checkout/sessions/${encodeURIComponent(session_id)}`
    );

    if (status !== 200) {
      return res.status(400).json({ error: 'Purchase session not found.' });
    }

    if (data.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment has not been completed.' });
    }

    const slug = String(data.client_reference_id || '').toLowerCase().trim();

    if (!COURSE_MAP[slug]) {
      return res.status(400).json({
        error: 'We could not determine which course you purchased. Please contact info@lbsconnect.net with your receipt.',
      });
    }

    if (!COURSE_AVAILABLE.has(slug)) {
      return res.status(400).json({
        error: `${COURSE_MAP[slug]} isn't available yet. If you were charged for it, contact info@lbsconnect.net with your receipt and we'll make it right.`,
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    courseTokens.set(token, { slug, expiresAt: Date.now() + COURSE_TOKEN_TTL });
    courseSessionIndex.set(session_id, token);

    return grantAccess(slug, token);
  } catch (err) {
    console.error('Stripe verify-course error:', err.message);
    return res.status(502).json({ error: 'Verification failed. Please refresh the page or contact info@lbsconnect.net.' });
  }
});

// ── GET /api/download?token=xxx[&file=slug] ───────────────────────────────────
// Streams the purchased file.
// Individual buyers: always gets their purchased template (file param ignored).
// Bundle buyers:     gets ZIP by default, or any individual template via ?file=slug.
app.get('/api/download', apiLimiter, (req, res) => {
  const { token, file } = req.query;

  if (!token) {
    return res.status(400).send('Missing download token.');
  }

  const entry = tokens.get(String(token));
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(403).send(
      'This download link has expired. Return to your download page and refresh to get a new one.'
    );
  }

  let slug;
  if (entry.template === 'bundle') {
    // Bundle buyers can download any file or the ZIP
    slug = (file && TEMPLATE_MAP[String(file)]) ? String(file) : 'bundle';
  } else {
    // Individual buyers are locked to the template they purchased
    slug = entry.template;
  }

  const filename = TEMPLATE_MAP[slug];
  const filePath = path.join(DOWNLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found. Please contact info@lbsconnect.net for assistance.');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const contentType = filename.endsWith('.zip')
    ? 'application/zip'
    : filename.endsWith('.pdf')
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  res.setHeader('Content-Type', contentType);

  const stream = fs.createReadStream(filePath);
  // Same TOCTOU/crash concern as the course-file stream above.
  stream.on('error', (err) => {
    console.error('Download file stream error:', err.message);
    if (!res.headersSent) res.status(500).send('Unable to read file. Please contact info@lbsconnect.net for assistance.');
    else res.destroy();
  });
  stream.pipe(res);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Fallback error handler ────────────────────────────────────────────────────
// Express's built-in default error handler renders an HTML page with the raw
// err.stack whenever app.get('env') !== 'production' — and that env value
// just mirrors process.env.NODE_ENV, which nothing in this repo (including
// render.yaml) sets. Rather than depend on the host happening to set it,
// this always returns a generic JSON error, in production or not.
app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ error: 'Something went wrong. Please try again or contact info@lbsconnect.net.' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`LBS server listening on port ${PORT}`));
}

module.exports = app;
