'use strict';

/**
 * Tests for the free BA template lead magnet:
 *   - Protected file access (direct static paths blocked)
 *   - POST /api/templates/request (lead validation, forwarding, token issuance)
 *   - GET /api/download (token validation + file streaming)
 *   - Retired shop/academy/software pages 301 to their replacements
 */

const nock    = require('nock');
const request = require('supertest');

process.env.LEAD_FORM_ENDPOINT = 'https://leads.example.test/f/lead123';

const app = require('../server');

const LEAD_HOST = 'https://leads.example.test';
const LEAD_PATH = '/f/lead123';

const VALID_LEAD = {
  name: 'Jane Smith',
  email: 'Jane.Smith@Agency.gov',
  organization: 'Texas DOT',
  role: 'Business Analyst',
  consent: true,
};

/** Submit a valid lead (forwarding mocked) and return the issued token. */
async function getToken() {
  nock(LEAD_HOST).post(LEAD_PATH).reply(200, { ok: true });
  const res = await request(app).post('/api/templates/request').send(VALID_LEAD);
  expect(res.status).toBe(200);
  return res.body.token;
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
// 2. POST /api/templates/request — validation
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/templates/request — validation', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/templates/request').send({ ...VALID_LEAD, name: '  ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app).post('/api/templates/request').send({ ...VALID_LEAD, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 when consent is not given', async () => {
    const res = await request(app).post('/api/templates/request').send({ ...VALID_LEAD, consent: false });
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-JSON body', async () => {
    const res = await request(app)
      .post('/api/templates/request')
      .set('Content-Type', 'text/plain')
      .send('name=x');
    expect(res.status).toBe(400);
  });

  it('returns 400 (not 500) for malformed JSON, without echoing parser internals', async () => {
    const res = await request(app)
      .post('/api/templates/request')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.text).not.toMatch(/SyntaxError|Unexpected/);
  });

  it('returns 413 for an oversized body', async () => {
    const res = await request(app)
      .post('/api/templates/request')
      .send({ ...VALID_LEAD, organization: 'x'.repeat(20000) });
    expect(res.status).toBe(413);
  });

  it('honeypot submissions get a fake success, no lead is forwarded, and the token does not work', async () => {
    const scope = nock(LEAD_HOST).post(LEAD_PATH).reply(200);
    const res = await request(app).post('/api/templates/request').send({ ...VALID_LEAD, _gotcha: 'spam' });
    expect(res.status).toBe(200);
    expect(scope.isDone()).toBe(false);

    const dl = await request(app).get(`/api/download?token=${res.body.token}`);
    expect(dl.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/templates/request — success and forwarding
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/templates/request — success', () => {
  it('forwards the cleaned lead and returns a token', async () => {
    let forwarded;
    nock(LEAD_HOST)
      .post(LEAD_PATH, (body) => { forwarded = body; return true; })
      .reply(200, { ok: true });

    const res = await request(app).post('/api/templates/request').send(VALID_LEAD);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toMatch(/^[a-f0-9]{64}$/);
    expect(forwarded).toMatchObject({
      name: 'Jane Smith',
      email: 'jane.smith@agency.gov',
      organization: 'Texas DOT',
      role: 'Business Analyst',
      source: 'free-ba-templates',
    });
    expect(forwarded).not.toHaveProperty('consent');
  });

  it('still issues a token when lead forwarding fails (network error)', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    nock(LEAD_HOST).post(LEAD_PATH).replyWithError('ECONNRESET');

    const res = await request(app).post('/api/templates/request').send(VALID_LEAD);

    expect(res.status).toBe(200);
    expect(res.body.token).toMatch(/^[a-f0-9]{64}$/);
    // The lead is logged so it can be recovered.
    expect(spy.mock.calls.flat().join(' ')).toContain('jane.smith@agency.gov');
    spy.mockRestore();
  });

  it('still issues a token when the lead endpoint returns a non-2xx status', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    nock(LEAD_HOST).post(LEAD_PATH).reply(422, { error: 'nope' });

    const res = await request(app).post('/api/templates/request').send(VALID_LEAD);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.text).not.toMatch(/nope/);
    spy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /api/download — token validation
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/download — token validation', () => {
  it('returns 400 when token param is missing', async () => {
    const res = await request(app).get('/api/download');
    expect(res.status).toBe(400);
  });

  it('returns 403 for a random invalid token', async () => {
    const res = await request(app).get('/api/download?token=deadbeef');
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /api/download — serving files with a lead token
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/download — free templates', () => {
  let token;
  beforeAll(async () => { token = await getToken(); });

  it('serves the ZIP bundle by default', async () => {
    const res = await request(app).get(`/api/download?token=${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/zip/);
    expect(res.headers['content-disposition']).toContain('ba-templates-bundle.zip');
  });

  test.each([
    ['brd', 'ba-template-brd.docx'],
    ['rtm', 'ba-template-rtm.docx'],
    ['test-case', 'ba-template-test-case.docx'],
  ])('serves ?file=%s as %s', async (slug, filename) => {
    const res = await request(app).get(`/api/download?token=${token}&file=${slug}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/wordprocessingml/);
    expect(res.headers['content-disposition']).toContain(filename);
  });

  it('falls back to the ZIP for an unrecognised ?file=', async () => {
    const res = await request(app).get(`/api/download?token=${token}&file=../../server.js`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('ba-templates-bundle.zip');
  });

  it('the retired AI prompt PDFs are no longer downloadable', async () => {
    const res = await request(app).get(`/api/download?token=${token}&file=ai-complete`);
    expect(res.headers['content-disposition']).not.toMatch(/ai-prompts/);
  });

  it('token is reusable within its TTL', async () => {
    const r1 = await request(app).get(`/api/download?token=${token}&file=brd`);
    const r2 = await request(app).get(`/api/download?token=${token}&file=brd`);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Retired pages redirect permanently
// ─────────────────────────────────────────────────────────────────────────────
describe('Retired pages 301 to their replacements', () => {
  test.each([
    ['/shop.html', '/free-ba-templates.html'],
    ['/ba-template-store.html', '/free-ba-templates.html'],
    ['/ba-template-store-download.html', '/free-ba-templates.html'],
    ['/ai-prompt-library.html', '/free-ba-templates.html'],
    ['/ai-prompt-library-download.html', '/free-ba-templates.html'],
    ['/academy.html', '/services.html'],
    ['/software.html', '/portfolio.html'],
  ])('GET %s → 301 %s', async (from, to) => {
    const res = await request(app).get(from);
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe(to);
  });

  it('the free templates page itself is served', async () => {
    const res = await request(app).get('/free-ba-templates.html');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Free BA Templates/i);
  });
});
