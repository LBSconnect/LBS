'use strict';

/**
 * Security-audit regression tests (Worker 9 — OWASP-style checklist).
 *
 * These are ADDITIVE to tests/course-access.test.js and tests/download.test.js
 * (which already cover the happy paths and a baseline traversal case). This
 * file exists to pin down specific security *properties* as regression tests
 * so future changes to server.js can't silently reintroduce them:
 *
 *   1. Path traversal is rejected across multiple encodings, not just one.
 *   2. Error responses never leak stack traces, absolute file paths, or
 *      environment variable values/names.
 *   3. The course-access cookie is issued with the expected security flags.
 *   4. Protected download assets can never be reached via express.static
 *      directly (only through the token-gated /api/download route).
 */

const nock    = require('nock');
const request = require('supertest');
const path    = require('path');

process.env.STRIPE_SECRET_KEY = 'sk_test_fake';

const app = require('../server');

const STRIPE_HOST = 'https://api.stripe.com';

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

function cookiePair(setCookieHeader) {
  return setCookieHeader.split(';')[0];
}

beforeEach(() => nock.cleanAll());
afterEach(() => nock.cleanAll());
afterAll(() => nock.restore());

// ─────────────────────────────────────────────────────────────────────────────
// 1. Path traversal — multiple encodings, always rejected before file access
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /courses/:slug/* — path traversal is blocked under an authenticated cookie', () => {
  async function getAuthedCookie() {
    mockStripeSession('cs_traversal_suite', { client_reference_id: 'course-01' });
    const verify = await request(app).get('/api/verify-course?session_id=cs_traversal_suite');
    expect(verify.status).toBe(200);
    return cookiePair(verify.headers['set-cookie'][0]);
  }

  const attempts = [
    { label: 'single-encoded ../ to server.js',      path: '/courses/course-01/..%2f..%2fserver.js' },
    { label: 'double-encoded ../ to server.js',       path: '/courses/course-01/..%252f..%252fserver.js' },
    { label: 'single-encoded ../ to package.json',    path: '/courses/course-01/..%2f..%2fpackage.json' },
    { label: 'mixed-encoded traversal to .env-style', path: '/courses/course-01/%2e%2e%2f%2e%2e%2frender.yaml' },
    { label: 'deep traversal toward /etc/passwd',     path: '/courses/course-01/..%2f..%2f..%2f..%2f..%2fetc%2fpasswd' },
  ];

  it.each(attempts)('rejects $label with 400/404, never 200, and never serves file content', async ({ path: reqPath }) => {
    const cookie = await getAuthedCookie();

    const res = await request(app).get(reqPath).set('Cookie', cookie);

    // Never succeeds
    expect(res.status).not.toBe(200);
    expect([400, 404]).toContain(res.status);

    // Never leaks the contents of the file it tried to reach
    expect(res.text).not.toMatch(/STRIPE_SECRET_KEY/);
    expect(res.text).not.toMatch(/root:.*:0:0:/); // /etc/passwd signature
    expect(res.text).not.toMatch(/"dependencies"/); // package.json signature
  });

  it('a request that legitimately resolves within the course directory still works', async () => {
    const cookie = await getAuthedCookie();
    const res = await request(app).get('/courses/course-01/index.html').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Error responses never leak internals
// ─────────────────────────────────────────────────────────────────────────────
describe('Error responses never leak stack traces, absolute paths, or env var contents', () => {
  const REPO_ROOT_MARKER = path.join(__dirname, '..'); // absolute path fragment that must never appear

  it('GET /api/verify with a malformed session id', async () => {
    const res = await request(app).get('/api/verify?session_id=not-a-real-session');
    expect(res.body.error).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/at [A-Za-z]+\.[A-Za-z]+ \(/); // stack frame signature
    expect(JSON.stringify(res.body)).not.toContain(REPO_ROOT_MARKER);
  });

  it('GET /api/verify-course with a malformed session id', async () => {
    const res = await request(app).get('/api/verify-course?session_id=not-a-real-session');
    expect(res.body.error).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/at [A-Za-z]+\.[A-Za-z]+ \(/);
  });

  it('GET /api/verify when Stripe returns a network/parse error surfaces a generic 502, not the raw error', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_boom')
      .reply(200, 'not json{{{'); // triggers the JSON.parse catch path in stripeGet()

    const res = await request(app).get('/api/verify?session_id=cs_boom');
    expect(res.status).toBe(502);
    expect(res.body.error).toBe('Verification failed. Please refresh the page or contact info@lbsconnect.net.');
    expect(JSON.stringify(res.body)).not.toMatch(/SyntaxError/);
    expect(JSON.stringify(res.body)).not.toContain(REPO_ROOT_MARKER);
  });

  it('GET /api/download with an unknown token returns a plain 403, no internals', async () => {
    const res = await request(app).get('/api/download?token=0000000000000000000000000000000000000000000000000000000000000000');
    expect(res.status).toBe(403);
    expect(res.text).not.toContain(REPO_ROOT_MARKER);
    expect(res.text).not.toMatch(/at Object\./);
  });

  it('unmatched routes return Express default 404 with no stack trace', async () => {
    const res = await request(app).get('/this-route-does-not-exist-xyz');
    expect(res.status).toBe(404);
    expect(res.text).not.toContain(REPO_ROOT_MARKER);
    expect(res.text).not.toMatch(/at [A-Za-z]+\.[A-Za-z]+ \(/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Course-access cookie security flags
// ─────────────────────────────────────────────────────────────────────────────
describe('Course-access cookie is issued with correct security flags', () => {
  it('sets HttpOnly, Secure, SameSite=Lax, and a path scoped to the course', async () => {
    mockStripeSession('cs_cookie_flags', { client_reference_id: 'course-01' });
    const res = await request(app).get('/api/verify-course?session_id=cs_cookie_flags');

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'][0];

    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Secure/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Path=\/courses\/course-01/i);
    // Not a session cookie — should carry a long Max-Age (~400 days), not be absent
    expect(setCookie).toMatch(/Max-Age=\d+/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Protected downloadable assets are never reachable via static file serving
// ─────────────────────────────────────────────────────────────────────────────
describe('Protected purchasable assets cannot be fetched directly, only via /api/download', () => {
  const protectedPaths = [
    '/assets/downloads/ba-template-brd.docx',
    '/assets/downloads/ba-templates-bundle.zip',
    '/assets/downloads/ai-prompts-library-starter.pdf',
    '/assets/downloads/ai-prompts-library-complete.pdf',
  ];

  it.each(protectedPaths)('GET %s is blocked with 403 regardless of the file existing on disk', async (p) => {
    const res = await request(app).get(p);
    expect(res.status).toBe(403);
  });
});
