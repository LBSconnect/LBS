'use strict';

/**
 * End-to-end tests for the token-based download system.
 * Covers both BA Template Store and AI Prompt Library workflows:
 *   - Protected file access (direct static paths blocked)
 *   - GET /api/verify (Stripe session validation + token issuance)
 *   - GET /api/download (token validation + file streaming)
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
      client_reference_id: 'brd',
      ...overrides,
    });
}

beforeEach(() => nock.cleanAll());
afterEach(() => nock.cleanAll());
afterAll(() => nock.restore());

// ─────────────────────────────────────────────────────────────────────────────
// 1. Protected files — direct static access must be blocked
// ─────────────────────────────────────────────────────────────────────────────
describe('Protected files — direct access returns 403', () => {
  const PROTECTED = [
    '/assets/downloads/ba-template-brd.docx',
    '/assets/downloads/ba-template-frs.docx',
    '/assets/downloads/ba-template-user-stories.docx',
    '/assets/downloads/ba-template-process-mapping.docx',
    '/assets/downloads/ba-template-risk-register.docx',
    '/assets/downloads/ba-template-stakeholder-register.docx',
    '/assets/downloads/ba-template-rtm.docx',
    '/assets/downloads/ba-template-rfp.docx',
    '/assets/downloads/ba-template-project-charter.docx',
    '/assets/downloads/ba-template-test-case.docx',
    '/assets/downloads/ba-templates-bundle.zip',
    '/assets/downloads/ai-prompts-library-starter.pdf',
    '/assets/downloads/ai-prompts-library-complete.pdf',
  ];

  test.each(PROTECTED)('GET %s → 403', async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(403);
  });

  it('allows access to non-protected downloads (e.g. README.txt)', async () => {
    const res = await request(app).get('/assets/downloads/README.txt');
    expect([200, 404]).toContain(res.status); // not 403
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/verify — input validation
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/verify — validation', () => {
  it('returns 400 when session_id is missing', async () => {
    const res = await request(app).get('/api/verify');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when session_id does not start with cs_', async () => {
    const res = await request(app).get('/api/verify?session_id=pi_abc123');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when Stripe returns a non-200 status', async () => {
    nock(STRIPE_HOST)
      .get('/v1/checkout/sessions/cs_notfound')
      .reply(404, { error: { message: 'No such checkout.session' } });

    const res = await request(app).get('/api/verify?session_id=cs_notfound');
    expect(res.status).toBe(400);
  });

  it('returns 402 when payment_status is not paid', async () => {
    mockStripeSession('cs_unpaid', { payment_status: 'unpaid' });
    const res = await request(app).get('/api/verify?session_id=cs_unpaid');
    expect(res.status).toBe(402);
  });

  it('returns 400 when client_reference_id is an unknown slug', async () => {
    mockStripeSession('cs_bad_ref', { client_reference_id: 'not-a-real-product' });
    const res = await request(app).get('/api/verify?session_id=cs_bad_ref');
    expect(res.status).toBe(400);
  });

  it('returns 400 when client_reference_id is empty', async () => {
    mockStripeSession('cs_empty_ref', { client_reference_id: '' });
    const res = await request(app).get('/api/verify?session_id=cs_empty_ref');
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/verify — BA Template Store: all 10 individual slugs + bundle
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/verify — BA Template Store', () => {
  const BA_SLUGS = [
    'brd', 'frs', 'user-stories', 'process-mapping', 'risk-register',
    'stakeholder-register', 'rtm', 'rfp', 'project-charter', 'test-case',
  ];

  test.each(BA_SLUGS)('individual template "%s" returns token + pack:individual', async (slug) => {
    mockStripeSession(`cs_ba_${slug}`, { client_reference_id: slug });
    const res = await request(app).get(`/api/verify?session_id=cs_ba_${slug}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ pack: 'individual', template: slug });
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token).toHaveLength(64); // 32 bytes hex
    expect(res.body.templateName).toBeTruthy();
  });

  it('bundle returns token + pack:bundle', async () => {
    mockStripeSession('cs_ba_bundle', { client_reference_id: 'bundle' });
    const res = await request(app).get('/api/verify?session_id=cs_ba_bundle');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ pack: 'bundle', template: 'bundle' });
    expect(res.body.token).toHaveLength(64);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /api/verify — AI Prompt Library: starter + complete
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/verify — AI Prompt Library', () => {
  it('ai-starter returns token with template:ai-starter', async () => {
    mockStripeSession('cs_ai_starter', { client_reference_id: 'ai-starter' });
    const res = await request(app).get('/api/verify?session_id=cs_ai_starter');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ template: 'ai-starter' });
    expect(res.body.token).toHaveLength(64);
    expect(res.body.templateName).toContain('Starter');
  });

  it('ai-complete returns token with template:ai-complete', async () => {
    mockStripeSession('cs_ai_complete', { client_reference_id: 'ai-complete' });
    const res = await request(app).get('/api/verify?session_id=cs_ai_complete');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ template: 'ai-complete' });
    expect(res.body.token).toHaveLength(64);
    expect(res.body.templateName).toContain('Complete');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Session token caching — same session always returns the same token within TTL
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/verify — session token caching', () => {
  it('returns the same token for two calls with the same session_id', async () => {
    // Only one nock needed — second call hits the in-memory cache
    mockStripeSession('cs_cache_test', { client_reference_id: 'brd' });

    const r1 = await request(app).get('/api/verify?session_id=cs_cache_test');
    const r2 = await request(app).get('/api/verify?session_id=cs_cache_test');

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.body.token).toBe(r2.body.token);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /api/download — token validation
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/download — token validation', () => {
  it('returns 400 when token param is missing', async () => {
    const res = await request(app).get('/api/download');
    expect(res.status).toBe(400);
  });

  it('returns 403 for a random invalid token', async () => {
    const res = await request(app).get('/api/download?token=deadbeef1234');
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /api/download — BA Template Store file delivery
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/download — BA Template Store', () => {
  /** Helper: get a valid download token via /api/verify */
  async function getToken(sessionId, slug) {
    mockStripeSession(sessionId, { client_reference_id: slug });
    const res = await request(app).get(`/api/verify?session_id=${sessionId}`);
    expect(res.status).toBe(200);
    return res.body.token;
  }

  it('serves the correct .docx for a valid BRD token', async () => {
    const token = await getToken('cs_dl_brd', 'brd');
    const res   = await request(app).get(`/api/download?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-template-brd.docx');
    expect(res.headers['content-type']).toContain('wordprocessingml');
  });

  it('serves the correct .docx for a valid FRS token', async () => {
    const token = await getToken('cs_dl_frs', 'frs');
    const res   = await request(app).get(`/api/download?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-template-frs.docx');
  });

  it('serves the ZIP for a bundle token (no ?file= param)', async () => {
    const token = await getToken('cs_dl_bundle_zip', 'bundle');
    const res   = await request(app).get(`/api/download?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-templates-bundle.zip');
    expect(res.headers['content-type']).toBe('application/zip');
  });

  it('serves a specific template for a bundle token with ?file=rtm', async () => {
    const token = await getToken('cs_dl_bundle_file', 'bundle');
    const res   = await request(app).get(`/api/download?token=${token}&file=rtm`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-template-rtm.docx');
  });

  it('ignores ?file= for an individual token — always serves the purchased template', async () => {
    const token = await getToken('cs_dl_locked', 'brd');
    // Attempt to download FRS using a BRD token — must still get BRD
    const res   = await request(app).get(`/api/download?token=${token}&file=frs`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-template-brd.docx');
    expect(res.headers['content-disposition']).not.toContain('frs');
  });

  it('token remains valid for repeated downloads (not single-use)', async () => {
    const token = await getToken('cs_dl_repeat', 'project-charter');
    const r1    = await request(app).get(`/api/download?token=${token}`);
    const r2    = await request(app).get(`/api/download?token=${token}`);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.headers['content-disposition']).toContain('ba-template-project-charter.docx');
  });

  it('bundle token with unrecognised ?file= falls back to ZIP', async () => {
    const token = await getToken('cs_dl_bundle_bad_file', 'bundle');
    const res   = await request(app).get(`/api/download?token=${token}&file=not-a-real-slug`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-templates-bundle.zip');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET /api/download — AI Prompt Library file delivery
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/download — AI Prompt Library', () => {
  async function getToken(sessionId, slug) {
    mockStripeSession(sessionId, { client_reference_id: slug });
    const res = await request(app).get(`/api/verify?session_id=${sessionId}`);
    expect(res.status).toBe(200);
    return res.body.token;
  }

  it('serves the Starter PDF for an ai-starter token', async () => {
    const token = await getToken('cs_ai_dl_starter', 'ai-starter');
    const res   = await request(app).get(`/api/download?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ai-prompts-library-starter.pdf');
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('serves the Complete PDF for an ai-complete token', async () => {
    const token = await getToken('cs_ai_dl_complete', 'ai-complete');
    const res   = await request(app).get(`/api/download?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ai-prompts-library-complete.pdf');
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('ignores ?file= param for ai-starter — always serves the PDF', async () => {
    const token = await getToken('cs_ai_locked', 'ai-starter');
    // Should not be able to substitute a BA template via ?file=
    const res   = await request(app).get(`/api/download?token=${token}&file=brd`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ai-prompts-library-starter.pdf');
    expect(res.headers['content-disposition']).not.toContain('brd');
  });

  it('ai-starter token is reusable within TTL', async () => {
    const token = await getToken('cs_ai_repeat', 'ai-starter');
    const r1    = await request(app).get(`/api/download?token=${token}`);
    const r2    = await request(app).get(`/api/download?token=${token}`);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Cross-product isolation — tokens cannot be used across products
// ─────────────────────────────────────────────────────────────────────────────
describe('Cross-product isolation', () => {
  async function getToken(sessionId, slug) {
    mockStripeSession(sessionId, { client_reference_id: slug });
    const res = await request(app).get(`/api/verify?session_id=${sessionId}`);
    expect(res.status).toBe(200);
    return res.body.token;
  }

  it('an ai-starter token always serves the AI PDF, not a BA template', async () => {
    // Even if the client passes ?file=brd, they should get the AI PDF
    const token = await getToken('cs_iso_ai', 'ai-starter');
    const res   = await request(app).get(`/api/download?token=${token}&file=brd`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ai-prompts-library-starter.pdf');
  });

  it('a BRD token always serves BRD, not an AI PDF', async () => {
    const token = await getToken('cs_iso_ba', 'brd');
    const res   = await request(app).get(`/api/download?token=${token}&file=ai-complete`);

    expect(res.status).toBe(200);
    // ?file= is ignored for individual tokens; still serves BRD
    expect(res.headers['content-disposition']).toContain('ba-template-brd.docx');
  });
});
