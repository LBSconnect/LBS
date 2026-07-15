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

afterEach(() => nock.cleanAll());

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

  it('works for every course slug course-01 through course-10', async () => {
    const slugs = Array.from({ length: 10 }, (_, i) => `course-${String(i + 1).padStart(2, '0')}`);

    for (const slug of slugs) {
      mockStripeSession(`cs_${slug}`, { client_reference_id: slug });
      const res = await request(app).get(`/api/verify-course?session_id=cs_${slug}`);
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(slug);
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
    const cookie = await getCookie('cs_repeat', 'course-02');
    const r1 = await request(app).get('/courses/course-02/index.html').set('Cookie', cookie);
    const r2 = await request(app).get('/courses/course-02/index.html').set('Cookie', cookie);

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
