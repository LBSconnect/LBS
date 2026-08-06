'use strict';

/**
 * End-to-end tests for the Online Academy course access system.
 * Covers:
 *   - Protected course files (no direct access without a valid cookie)
 *   - GET /api/verify-course (Stripe session validation + cookie issuance)
 *   - GET /courses/:slug/* (cookie validation + file streaming)
 *   - Cross-course isolation and path-traversal protection
 */

const nock    = require('nock');
const request = require('supertest');

// ── Environment setup ────────────────────────────────────────────────────────
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';

const app = require('../server');

const STRIPE_HOST = 'https://api.stripe.com';

/** Register a nock intercept that returns a Stripe checkout.session response. */
function mockStripeSession(sessionId, overrides = {}) {
  nock(STRIPE_HOST)
    .get(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`)
    .reply(200, {
      id: sessionId,
      payment_status: 'paid',
      client_reference_id: 'course-01',
      ...overrides,
    });
}

/** Extract a bare "name=value" pair from a Set-Cookie header for replay. */
function cookiePair(setCookieHeader) {
  return setCookieHeader.split(';')[0];
}

beforeEach(() => nock.cleanAll());
afterEach(() => nock.cleanAll());
afterAll(() => nock.restore());

// ─────────────────────────────────────────────────────────────────────────────
// 1. Direct access — no cookie means no course content
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /courses/:slug/* — direct access without a valid cookie', () => {
  it('redirects to academy.html instead of serving the file', async () => {
    const res = await request(app).get('/courses/course-01/index.html');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/academy.html?locked=course-01');
  });

  it('returns 404 for an unknown course slug', async () => {
    const res = await request(app).get('/courses/course-99/index.html');
    expect(res.status).toBe(404);
  });

  it('a garbage/invalid cookie is treated the same as no cookie', async () => {
    const res = await request(app)
      .get('/courses/course-01/index.html')
      .set('Cookie', 'course_course-01=not-a-real-token');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/academy.html?locked=course-01');
  });

  it('GET /courses/:slug (no trailing file) redirects into index.html', async () => {
    const res = await request(app).get('/courses/course-01');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/courses/course-01/index.html');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/verify-course — input validation
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/verify-course — validation', () => {
  it('returns 400 when session_id is missing', async () => {
    const res = await request(app).get('/api/verify-course');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when session_id does not start with cs_', async () => {
    const res = await request(app).get('/api/verify-course?session_id=pi_abc123');
    expect(res.status).toBe(400);
  });

  it('returns 400 when Stripe returns a non-200 status', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_notfound')
      .reply(404, { error: { message: 'No such checkout.session' } });

    const res = await request(app).get('/api/verify-course?session_id=cs_notfound');
    expect(res.status).toBe(400);
  });

  it('returns 402 when payment_status is not paid', async () => {
    mockStripeSession('cs_unpaid', { payment_status: 'unpaid' });
    const res = await request(app).get('/api/verify-course?session_id=cs_unpaid');
    expect(res.status).toBe(402);
  });

  it('returns 400 when client_reference_id is not a known course slug', async () => {
    mockStripeSession('cs_bad_ref', { client_reference_id: 'brd' }); // a template slug, not a course
    const res = await request(app).get('/api/verify-course?session_id=cs_bad_ref');
    expect(res.status).toBe(400);
  });

  it('returns 400 when client_reference_id is empty', async () => {
    mockStripeSession('cs_empty_ref', { client_reference_id: '' });
    const res = await request(app).get('/api/verify-course?session_id=cs_empty_ref');
    expect(res.status).toBe(400);
  });

  it('returns 400 for a known slug that is not yet available for purchase', async () => {
    // course-02 has a working SCORM package but no finished video yet — not
    // for sale even though it's a valid, recognized course slug.
    mockStripeSession('cs_not_available', { client_reference_id: 'course-02' });
    const res = await request(app).get('/api/verify-course?session_id=cs_not_available');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("isn't available yet");
    // No cookie should be issued for an unavailable course.
    expect(res.headers['set-cookie']).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/verify-course — success grants a cookie for the purchased course
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/verify-course — success', () => {
  it('returns ok + slug + courseName, and sets a course_<slug> cookie', async () => {
    mockStripeSession('cs_course_01');
    const res = await request(app).get('/api/verify-course?session_id=cs_course_01');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, slug: 'course-01' });
    expect(res.body.courseName).toContain('Requirements Engineering');

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeTruthy();
    expect(setCookie.some((c) => c.startsWith('course_course-01='))).toBe(true);
    expect(setCookie.some((c) => /HttpOnly/i.test(c))).toBe(true);
  });

  it('returns the same session cached without re-hitting Stripe on a repeat call', async () => {
    // Only one nock needed — second call hits the in-memory session cache
    mockStripeSession('cs_course_cache');

    const r1 = await request(app).get('/api/verify-course?session_id=cs_course_cache');
    const r2 = await request(app).get('/api/verify-course?session_id=cs_course_cache');

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.body.slug).toBe(r2.body.slug);
  });

  it('succeeds only for the available courses (course-01, course-07) — the rest 400', async () => {
    const AVAILABLE = ['course-01', 'course-07'];
    const allSlugs = Array.from({ length: 10 }, (_, i) => `course-${String(i + 1).padStart(2, '0')}`);

    for (const slug of allSlugs) {
      mockStripeSession(`cs_avail_${slug}`, { client_reference_id: slug });
      const res = await request(app).get(`/api/verify-course?session_id=cs_avail_${slug}`);

      if (AVAILABLE.includes(slug)) {
        expect(res.status).toBe(200);
        expect(res.body.slug).toBe(slug);
      } else {
        expect(res.status).toBe(400);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /courses/:slug/* — serving content once a valid cookie is issued
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /courses/:slug/* — with a valid cookie', () => {
  async function getCookie(sessionId, slug) {
    mockStripeSession(sessionId, { client_reference_id: slug });
    const res = await request(app).get(`/api/verify-course?session_id=${sessionId}`);
    expect(res.status).toBe(200);
    return cookiePair(res.headers['set-cookie'][0]);
  }

  it('serves index.html for the purchased course', async () => {
    const cookie = await getCookie('cs_serve_01', 'course-01');
    const res = await request(app)
      .get('/courses/course-01/index.html')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<div id="app">');
  });

  it('serves sibling assets (css/js/images) under the same cookie', async () => {
    const cookie = await getCookie('cs_serve_assets', 'course-01');

    const css = await request(app).get('/courses/course-01/style.css').set('Cookie', cookie);
    expect(css.status).toBe(200);
    expect(css.headers['content-type']).toContain('text/css');

    const js = await request(app).get('/courses/course-01/player.js').set('Cookie', cookie);
    expect(js.status).toBe(200);
    expect(js.headers['content-type']).toContain('javascript');

    const img = await request(app).get('/courses/course-01/slides/slide-1.jpg').set('Cookie', cookie);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toBe('image/jpeg');
  });

  it('the cookie is reusable across repeated requests (not single-use)', async () => {
    // course-07 is the second available course (course-02 is a valid slug but
    // not yet for sale — see the availability tests above).
    const cookie = await getCookie('cs_repeat', 'course-07');
    const r1 = await request(app).get('/courses/course-07/index.html').set('Cookie', cookie);
    const r2 = await request(app).get('/courses/course-07/index.html').set('Cookie', cookie);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Cross-course isolation — a cookie for one course must not unlock another
// ─────────────────────────────────────────────────────────────────────────────
describe('Cross-course isolation', () => {
  it('a course-01 cookie does not grant access to course-02', async () => {
    mockStripeSession('cs_iso_01', { client_reference_id: 'course-01' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_iso_01');
    const cookie = cookiePair(verify.headers['set-cookie'][0]);

    // Replay the course-01 cookie, but under the course-02 cookie name, against course-02
    const forged = cookie.replace('course_course-01=', 'course_course-02=');

    const res = await request(app)
      .get('/courses/course-02/index.html')
      .set('Cookie', forged);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/academy.html?locked=course-02');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Path traversal protection
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /courses/:slug/* — path traversal protection', () => {
  it('rejects a request that tries to escape the course directory', async () => {
    mockStripeSession('cs_traversal', { client_reference_id: 'course-01' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_traversal');
    const cookie = cookiePair(verify.headers['set-cookie'][0]);

    const res = await request(app)
      .get('/courses/course-01/..%2f..%2fserver.js')
      .set('Cookie', cookie);

    expect([400, 404]).toContain(res.status);
    expect(res.text).not.toMatch(/STRIPE_SECRET_KEY/);
  });
});

// =============================================================================
// Worker 4 additions (Authentication / Session Management audit) — keep new
// cases in this block so merges with other workers' additions stay clean.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// W4-1. GET /api/verify-course — session_id shape validation (additional cases)
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4] GET /api/verify-course — additional session_id validation', () => {
  it('returns 400 for an empty session_id value (?session_id=)', async () => {
    const res = await request(app).get('/api/verify-course?session_id=');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a session_id that is only whitespace', async () => {
    const res = await request(app).get('/api/verify-course?session_id=%20%20%20');
    expect(res.status).toBe(400);
  });

  it('returns 400 (not a 500) when session_id is supplied twice (array input)', async () => {
    // Express parses repeated query keys as an array; String(array) must not crash the handler.
    const res = await request(app).get('/api/verify-course?session_id=cs_a&session_id=cs_b');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('the JSON error body never contains a stack trace or file path', async () => {
    const res = await request(app).get('/api/verify-course?session_id=not-cs-prefixed');
    expect(res.status).toBe(400);
    expect(res.body.error).not.toMatch(/at\s+\S+\s+\(|\.js:\d+:\d+/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W4-2. GET /api/verify-course — STRIPE_SECRET_KEY unset
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4] GET /api/verify-course — STRIPE_SECRET_KEY unset', () => {
  it('returns 503 with a generic, non-technical JSON error and no stack trace', async () => {
    const original = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    try {
      const res = await request(app).get('/api/verify-course?session_id=cs_whatever_it_does_not_matter');

      expect(res.status).toBe(503);
      expect(res.type).toMatch(/json/);
      expect(res.body).toEqual({
        error: 'Payment verification is temporarily unavailable. Please contact info@lbsconnect.net.',
      });
      // No stack trace / internal detail leakage of any kind.
      expect(JSON.stringify(res.body)).not.toMatch(/at\s+\S+\s+\(|node_modules|\.js:\d+:\d+|Error:/);
    } finally {
      process.env.STRIPE_SECRET_KEY = original;
    }
  });

  it('the /api/verify (download) endpoint has the same fail-closed behavior', async () => {
    // Not this worker's primary surface, but confirms both verify endpoints share
    // the same fail-closed contract when the Stripe key is missing.
    const original = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    try {
      const res = await request(app).get('/api/verify?session_id=cs_whatever');
      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('error');
    } finally {
      process.env.STRIPE_SECRET_KEY = original;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W4-3. GET /courses/:slug/* — locked redirect: slug encoding sanity
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4] GET /courses/:slug/* — locked-redirect slug encoding', () => {
  it('every registered course slug round-trips cleanly through the locked redirect', async () => {
    // COURSE_MAP is gated ahead of the redirect (unknown slugs 404 before the
    // encodeURIComponent() call is ever reached), so real slugs are always the
    // plain `course-NN` shape. This test pins that contract: if a future slug
    // ever contains characters needing escaping, this will catch a broken
    // (unescaped) Location header rather than silently passing.
    const slugs = Array.from({ length: 10 }, (_, i) => `course-${String(i + 1).padStart(2, '0')}`);
    for (const slug of slugs) {
      const res = await request(app).get(`/courses/${slug}/index.html`);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(`/academy.html?locked=${encodeURIComponent(slug)}`);
    }
  });

  it('an unregistered slug 404s before any redirect/encoding is attempted', async () => {
    // Confirms the 404 gate really does run first — a slug with characters that
    // would need escaping never reaches the encodeURIComponent() call.
    const res = await request(app).get('/courses/course%20weird%2Fslug/index.html');
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W4-4. GET /courses/:slug/* — raw dot-segment traversal (unencoded ../..)
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4] GET /courses/:slug/* — raw ../../ traversal attempts', () => {
  it('a raw ../../ segment never reaches course content (Express normalizes it away from the route)', async () => {
    mockStripeSession('cs_traversal_raw', { client_reference_id: 'course-01' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_traversal_raw');
    const cookie = cookiePair(verify.headers['set-cookie'][0]);

    const res = await request(app)
      .get('/courses/course-01/../../etc/passwd')
      .set('Cookie', cookie);

    // Express's router collapses the dot-segments before route matching, so this
    // never lands inside our /courses/:slug/* handler at all — it 404s upstream.
    // The key security property either way: no file content is ever returned.
    expect(res.status).not.toBe(200);
  });

  it('percent-encoded dot segments combined with literal slashes are rejected by the in-handler guard', async () => {
    mockStripeSession('cs_traversal_dots', { client_reference_id: 'course-01' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_traversal_dots');
    const cookie = cookiePair(verify.headers['set-cookie'][0]);

    const res = await request(app)
      .get('/courses/course-01/..%2f..%2f..%2fetc%2fpasswd')
      .set('Cookie', cookie);

    expect(res.status).toBe(400);
    expect(res.text).toBe('Invalid path.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W4-5. Expired course-access token
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4] GET /courses/:slug/* — expired token', () => {
  const realDateNow = Date.now.bind(Date);
  afterEach(() => jest.restoreAllMocks());

  it('a cookie whose token has passed its expiresAt is rejected like no cookie at all', async () => {
    mockStripeSession('cs_expiry', { client_reference_id: 'course-01' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_expiry');
    expect(verify.status).toBe(200);
    const cookie = cookiePair(verify.headers['set-cookie'][0]);

    // Sanity check: right after issuance, the cookie works.
    const before = await request(app).get('/courses/course-01/index.html').set('Cookie', cookie);
    expect(before.status).toBe(200);

    // Jump the clock past the 400-day TTL (COURSE_TOKEN_TTL) and retry with the
    // same cookie — the entry.expiresAt < Date.now() branch must now trigger.
    const past400Days = realDateNow() + 401 * 24 * 60 * 60 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(past400Days);

    const after = await request(app).get('/courses/course-01/index.html').set('Cookie', cookie);
    expect(after.status).toBe(302);
    expect(after.headers.location).toBe('/academy.html?locked=course-01');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W4-6. Cross-purchase isolation — additional pairing (course-07 vs course-01)
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4] Cross-purchase isolation — additional slug pairing', () => {
  it('a course-07 cookie forged under the course-01 cookie name does not unlock course-01', async () => {
    mockStripeSession('cs_iso_07', { client_reference_id: 'course-07' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_iso_07');
    const cookie = cookiePair(verify.headers['set-cookie'][0]);

    const forged = cookie.replace('course_course-07=', 'course_course-01=');

    const res = await request(app).get('/courses/course-01/index.html').set('Cookie', forged);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/academy.html?locked=course-01');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W4-7. KNOWN FINDING — deferred to Worker 1 (server.js owner), not fixed here.
//
// express.static(path.join(__dirname)) serves the ENTIRE repository root as
// static files, including server.js, package.json, render.yaml, and the whole
// tests/ directory. This is unrelated to the /courses/:slug/* traversal guard
// (which is verified correct above) — it is a separate, direct route any
// visitor can hit with no cookie at all. No secrets are hardcoded (Stripe key
// comes from an env var per render.yaml), but the full server source/business
// logic is exposed. Proposed fix: move public site files into a dedicated
// `public/` directory and point express.static() there only, or add an explicit
// denylist (server.js, package*.json, render.yaml, tests/) ahead of the static
// middleware. FIXED by Worker 1 (server.js now 404s these paths ahead of
// express.static()) — flipped from `describe.skip` to `describe` so this is
// now a live regression test guarding against the fix ever regressing.
// ─────────────────────────────────────────────────────────────────────────────
describe('[W4][FIXED by Worker 1] server source files should not be publicly downloadable', () => {
  it('GET /server.js should not return the server source', async () => {
    const res = await request(app).get('/server.js');
    expect(res.status).toBe(404);
  });

  it('GET /package.json should not return repo metadata', async () => {
    const res = await request(app).get('/package.json');
    expect(res.status).toBe(404);
  });
});
