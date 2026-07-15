'use strict';

const express = require('express');
const path    = require('path');
const https   = require('https');
const crypto  = require('crypto');
const fs      = require('fs');

const PORT = process.env.PORT || 3000;
const app  = express();

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
  fs.createReadStream(filePath).pipe(res);
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
    const req  = https.request(
      { hostname: 'api.stripe.com', path: apiPath, method: 'GET',
        headers: { Authorization: `Basic ${auth}` } },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
          catch (e) { reject(e); }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

// ── GET /api/verify?session_id=cs_xxx ────────────────────────────────────────
// Verifies a completed Stripe checkout session and returns a download token.
// The same session always returns the same token within its 24-hour window.
app.get('/api/verify', async (req, res) => {
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
app.get('/api/verify-course', async (req, res) => {
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
app.get('/api/download', (req, res) => {
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

  fs.createReadStream(filePath).pipe(res);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`LBS server listening on port ${PORT}`));
}

module.exports = app;
