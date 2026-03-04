'use strict';

const { Resend } = require('resend');
const http = require('http');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const TO_EMAIL = 'info@lbsconnect.net';
const PORT = process.env.PORT || 3000;

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://lbsconnect.net',
  'https://www.lbsconnect.net',
];

function corsHeaders(req) {
  const origin = req.headers['origin'] || '';
  const allowed =
    ALLOWED_ORIGINS.includes(origin) || /\.onrender\.com$/.test(origin)
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const headers = corsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Contact form endpoint
  if (req.method === 'POST' && req.url === '/contact') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      res.writeHead(400, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
      return;
    }

    const { first_name, last_name, email, organization, package: pkg, message, timeline } = body;

    if (!first_name || !last_name || !email || !message) {
      res.writeHead(422, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    const packageLabels = {
      silver: 'Silver — Clarity & Readiness ($7,500)',
      gold: 'Gold — Modernization Sprint ($20,000)',
      platinum: 'Platinum — Full Execution ($55,000)',
      prime: 'Prime / Subcontracting Inquiry',
      unsure: 'Not sure yet — need guidance',
    };

    const timelineLabels = {
      asap: 'ASAP — we have a deadline',
      '30days': 'Within 30 days',
      quarter: 'This quarter',
      planning: 'Planning / exploring options',
    };

    const emailHtml = `
<h2>New Contact Form Submission</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
  <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${first_name} ${last_name}</td></tr>
  <tr><td style="font-weight:bold;padding-right:16px;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
  ${organization ? `<tr><td style="font-weight:bold;padding-right:16px;">Organization</td><td>${organization}</td></tr>` : ''}
  ${pkg ? `<tr><td style="font-weight:bold;padding-right:16px;">Package</td><td>${packageLabels[pkg] || pkg}</td></tr>` : ''}
  ${timeline ? `<tr><td style="font-weight:bold;padding-right:16px;">Timeline</td><td>${timelineLabels[timeline] || timeline}</td></tr>` : ''}
</table>
<h3 style="margin-top:24px;">Message</h3>
<p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${message}</p>
`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `New inquiry from ${first_name} ${last_name}${organization ? ` — ${organization}` : ''}`,
        html: emailHtml,
      });

      res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error('Resend error:', err);
      res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to send email' }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`LBS contact API listening on port ${PORT}`);
});
