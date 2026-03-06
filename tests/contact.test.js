'use strict';

// Set required env vars before requiring the server module
process.env.RESEND_API_KEY = 'test-key';
process.env.RESEND_FROM_EMAIL = 'noreply@test.lbsconnect.net';

// Mock the Resend SDK so no real emails are sent
const mockSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

const request = require('supertest');
const app = require('../server');

const validPayload = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  message: 'Hello, I need help with a project.',
};

afterEach(() => {
  mockSend.mockReset();
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns 200 with { ok: true }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

// ---------------------------------------------------------------------------
// POST /contact — validation
// ---------------------------------------------------------------------------
describe('POST /contact — validation', () => {
  it('returns 422 when body is empty', async () => {
    const res = await request(app).post('/contact').send({});
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it.each(['first_name', 'last_name', 'email', 'message'])(
    'returns 422 when %s is missing',
    async (field) => {
      const payload = { ...validPayload };
      delete payload[field];
      const res = await request(app).post('/contact').send(payload);
      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
    }
  );
});

// ---------------------------------------------------------------------------
// POST /contact — happy path
// ---------------------------------------------------------------------------
describe('POST /contact — successful submission', () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({ data: { id: 'mock-email-id' }, error: null });
  });

  it('returns 200 with { ok: true }', async () => {
    const res = await request(app).post('/contact').send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('sends exactly two emails (notification + confirmation)', async () => {
    await request(app).post('/contact').send(validPayload);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('sends notification email to info@lbsconnect.net', async () => {
    await request(app).post('/contact').send(validPayload);
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].to).toBe('info@lbsconnect.net');
  });

  it('sets reply-to on notification email to submitter address', async () => {
    await request(app).post('/contact').send(validPayload);
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].replyTo).toBe('jane@example.com');
  });

  it('includes submitter name in notification subject', async () => {
    await request(app).post('/contact').send(validPayload);
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].subject).toContain('Jane Doe');
  });

  it('sends confirmation email to the submitter', async () => {
    await request(app).post('/contact').send(validPayload);
    const confirmArgs = mockSend.mock.calls[1];
    expect(confirmArgs[0].to).toBe('jane@example.com');
  });

  it('includes organization in notification subject when provided', async () => {
    await request(app)
      .post('/contact')
      .send({ ...validPayload, organization: 'Acme Corp' });
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].subject).toContain('Acme Corp');
  });

  it('resolves package codes to human-readable labels in email HTML', async () => {
    await request(app)
      .post('/contact')
      .send({ ...validPayload, package: 'gold' });
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].html).toContain('Modernization Sprint');
  });

  it('resolves timeline codes to human-readable labels in email HTML', async () => {
    await request(app)
      .post('/contact')
      .send({ ...validPayload, timeline: 'asap' });
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].html).toContain('ASAP');
  });

  it('includes phone number in notification email HTML when provided', async () => {
    await request(app)
      .post('/contact')
      .send({ ...validPayload, phone: '(512) 555-0100' });
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].html).toContain('(512) 555-0100');
  });

  it('includes phone number in confirmation email HTML when provided', async () => {
    await request(app)
      .post('/contact')
      .send({ ...validPayload, phone: '(512) 555-0100' });
    const confirmArgs = mockSend.mock.calls[1];
    expect(confirmArgs[0].html).toContain('(512) 555-0100');
  });

  it('omits phone row when phone is not provided', async () => {
    await request(app).post('/contact').send(validPayload);
    const [notifArgs] = mockSend.mock.calls;
    expect(notifArgs[0].html).not.toContain('Phone');
  });
});

// ---------------------------------------------------------------------------
// POST /contact — error handling
// ---------------------------------------------------------------------------
describe('POST /contact — error handling', () => {
  it('returns 500 when Resend returns an API error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } });
    const res = await request(app).post('/contact').send(validPayload);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 when Resend throws an exception', async () => {
    mockSend.mockRejectedValue(new Error('Network failure'));
    const res = await request(app).post('/contact').send(validPayload);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('still returns 200 when confirmation email fails (best-effort)', async () => {
    mockSend
      .mockResolvedValueOnce({ data: { id: 'notify-id' }, error: null }) // notification succeeds
      .mockRejectedValueOnce(new Error('Confirmation failed'));             // confirmation throws

    const res = await request(app).post('/contact').send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('still returns 200 when confirmation email returns an error object (best-effort)', async () => {
    mockSend
      .mockResolvedValueOnce({ data: { id: 'notify-id' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Bounced' } });

    const res = await request(app).post('/contact').send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
