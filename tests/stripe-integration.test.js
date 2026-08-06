'use strict';

/**
 * Worker 5 (Database/APIs/Third-Party Integrations) additions.
 *
 * These tests specifically target the Stripe REST integration in server.js
 * (GET /v1/checkout/sessions/:id via stripeGet()) for failure modes not
 * already covered by tests/download.test.js and tests/course-access.test.js:
 *   - network-level failures talking to Stripe (connection reset / DNS / etc.)
 *   - a malformed (non-JSON) response body from Stripe
 *   - confirmation that no Stripe error internals or the secret key ever
 *     leak into a client-facing response
 *   - a "malformed" session_id containing unexpected characters, to confirm
 *     it's safely percent-encoded on the way to Stripe and never crashes
 *     the process
 *
 * NOTE: This is a separate file from tests/download.test.js and
 * tests/course-access.test.js (additive-only, per worker file-ownership
 * rules) to avoid clobbering Worker 4's edits to the existing test files.
 */

const nock    = require('nock');
const request = require('supertest');

process.env.STRIPE_SECRET_KEY = 'sk_test_fake_worker5';

const app = require('../server');

const STRIPE_HOST = 'https://api.stripe.com';

afterEach(() => nock.cleanAll());

// ─────────────────────────────────────────────────────────────────────────────
// 1. Network-level failures — must be caught, not crash the process
// ─────────────────────────────────────────────────────────────────────────────
describe('Stripe network-level failures are caught (not thrown/crashed)', () => {
  it('GET /api/verify: a connection-reset talking to Stripe returns 502 with a generic message', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_neterr')
      .replyWithError('ECONNRESET: connection reset');

    const res = await request(app).get('/api/verify?session_id=cs_worker5_neterr');

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).not.toMatch(/ECONNRESET/);
    expect(res.body.error).not.toMatch(/connection reset/i);
  });

  it('GET /api/verify-course: a connection-reset talking to Stripe returns 502 with a generic message', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_neterr_course')
      .replyWithError('ECONNRESET: connection reset');

    const res = await request(app).get('/api/verify-course?session_id=cs_worker5_neterr_course');

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).not.toMatch(/ECONNRESET/);
  });

  it('the server keeps serving other requests after a Stripe network failure (process did not crash)', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_neterr2')
      .replyWithError('socket hang up');

    const failed = await request(app).get('/api/verify?session_id=cs_worker5_neterr2');
    expect(failed.status).toBe(502);

    // A completely unrelated route should still respond normally afterward.
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ ok: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Malformed (non-JSON) response body from Stripe
// ─────────────────────────────────────────────────────────────────────────────
describe('Malformed Stripe response body is handled safely', () => {
  it('GET /api/verify: a non-JSON 200 body from Stripe returns 502, not a 500/crash', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_badjson')
      .reply(200, 'this is not valid json{{{');

    const res = await request(app).get('/api/verify?session_id=cs_worker5_badjson');

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
    // The raw JSON.parse error / malformed body text must never reach the client.
    expect(res.body.error).not.toMatch(/Unexpected token/);
    expect(res.text).not.toMatch(/this is not valid json/);
  });

  it('GET /api/verify-course: a non-JSON 200 body from Stripe returns 502, not a 500/crash', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_badjson_course')
      .reply(200, '<html>not json</html>');

    const res = await request(app).get('/api/verify-course?session_id=cs_worker5_badjson_course');

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Non-200 Stripe responses never leak Stripe's internal error text
// ─────────────────────────────────────────────────────────────────────────────
describe('Stripe error responses never leak internal details to the client', () => {
  it('GET /api/verify: a Stripe 401 (bad API key) style error is not echoed to the client', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_401')
      .reply(401, {
        error: {
          message: 'Invalid API Key provided: sk_test_fake_worker5',
          type: 'invalid_request_error',
        },
      });

    const res = await request(app).get('/api/verify?session_id=cs_worker5_401');

    expect(res.status).toBe(400);
    expect(res.text).not.toMatch(/Invalid API Key/);
    expect(res.text).not.toMatch(/sk_test_fake_worker5/);
    expect(res.text).not.toMatch(process.env.STRIPE_SECRET_KEY);
  });

  it('GET /api/verify-course: a Stripe 500 error is not echoed to the client', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_500')
      .reply(500, { error: { message: 'Internal stripe error, request id req_abc123' } });

    const res = await request(app).get('/api/verify-course?session_id=cs_worker5_500');

    expect(res.status).toBe(400);
    expect(res.text).not.toMatch(/req_abc123/);
    expect(res.text).not.toMatch(/Internal stripe error/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Malformed / unexpected-character session_id values
// ─────────────────────────────────────────────────────────────────────────────
describe('Malformed session_id values are handled safely', () => {
  it('a session_id with path-traversal-like characters is percent-encoded and does not crash the server', async () => {
    const weirdId = 'cs_../../etc/passwd';
    nock(STRIPE_HOST)
      .get(`/v1/checkout/sessions/${encodeURIComponent(weirdId)}`)
      .reply(404, { error: { message: 'No such checkout.session' } });

    const res = await request(app).get(`/api/verify?session_id=${encodeURIComponent(weirdId)}`);

    // Still starts with "cs_" so it passes input validation, then Stripe 404s it.
    expect(res.status).toBe(400);
    expect(res.body.error).not.toMatch(/No such checkout/);
  });

  it('a session_id with injected query-string characters is treated as an opaque value', async () => {
    const weirdId = 'cs_abc&foo=bar%00';
    nock(STRIPE_HOST)
      .get(`/v1/checkout/sessions/${encodeURIComponent(weirdId)}`)
      .reply(404, { error: { message: 'No such checkout.session' } });

    const res = await request(app).get(`/api/verify?session_id=${encodeURIComponent(weirdId)}`);

    expect(res.status).toBe(400);
  });

  it('an extremely long session_id does not crash the server', async () => {
    const longId = 'cs_' + 'a'.repeat(5000);
    nock(STRIPE_HOST)
      .get(`/v1/checkout/sessions/${encodeURIComponent(longId)}`)
      .reply(404, { error: { message: 'No such checkout.session' } });

    const res = await request(app).get(`/api/verify?session_id=${encodeURIComponent(longId)}`);

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Secret key hygiene — belt-and-suspenders on top of course-access.test.js's check
// ─────────────────────────────────────────────────────────────────────────────
describe('STRIPE_SECRET_KEY is never exposed to the client', () => {
  it('is absent from a successful /api/verify response', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_keycheck')
      .reply(200, { id: 'cs_worker5_keycheck', payment_status: 'paid', client_reference_id: 'brd' });

    const res = await request(app).get('/api/verify?session_id=cs_worker5_keycheck');

    expect(res.status).toBe(200);
    expect(res.text).not.toMatch(process.env.STRIPE_SECRET_KEY);
    expect(res.text).not.toMatch(/Authorization/i);
    expect(res.text).not.toMatch(/Basic /);
  });

  it('is absent from a successful /api/verify-course response (including headers)', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_worker5_keycheck_course')
      .reply(200, { id: 'cs_worker5_keycheck_course', payment_status: 'paid', client_reference_id: 'course-01' });

    const res = await request(app).get('/api/verify-course?session_id=cs_worker5_keycheck_course');

    expect(res.status).toBe(200);
    expect(res.text).not.toMatch(process.env.STRIPE_SECRET_KEY);
    expect(JSON.stringify(res.headers)).not.toMatch(process.env.STRIPE_SECRET_KEY);
  });
});
