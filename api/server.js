'use strict';

const { Resend } = require('resend');
const { Webhook } = require('svix');
const http = require('http');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const TO_EMAIL = 'info@lbsconnect.net';
const PORT = process.env.PORT || 3000;

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY environment variable is required');
  process.exit(1);
}
if (!FROM_EMAIL) {
  console.error('ERROR: RESEND_FROM_EMAIL environment variable is required (e.g. LBS Website <noreply@lbsconnect.net>). Using onboarding@resend.dev will silently drop emails.');
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
    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
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

    const confirmationHtml = `
<div style="font-family:sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;">
  <h2 style="color:#1a3a5c;">We received your message, ${first_name}!</h2>
  <p>Thank you for reaching out to <strong>Linton Business Solutions</strong>. We've received your inquiry and will get back to you within <strong>1 business day</strong>.</p>
  <h3 style="color:#1a3a5c;margin-top:24px;">Your submission summary</h3>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${first_name} ${last_name}</td></tr>
    ${organization ? `<tr><td style="font-weight:bold;padding-right:16px;">Organization</td><td>${organization}</td></tr>` : ''}
    ${pkg ? `<tr><td style="font-weight:bold;padding-right:16px;">Package Interest</td><td>${packageLabels[pkg] || pkg}</td></tr>` : ''}
    ${timeline ? `<tr><td style="font-weight:bold;padding-right:16px;">Timeline</td><td>${timelineLabels[timeline] || timeline}</td></tr>` : ''}
  </table>
  <p style="margin-top:24px;">In the meantime, feel free to reply to this email or reach us at <a href="mailto:info@lbsconnect.net">info@lbsconnect.net</a>.</p>
  <p style="margin-top:8px;">— The LBS Team</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin-top:32px;" />
  <p style="font-size:12px;color:#6b7280;">Linton Business Solutions · <a href="https://lbsconnect.net" style="color:#6b7280;">lbsconnect.net</a></p>
</div>
`;

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `New inquiry from ${first_name} ${last_name}${organization ? ` — ${organization}` : ''}`,
        html: emailHtml,
      });

      if (error) throw error;

      console.log('Notification email sent:', data.id);

      // Send confirmation email to submitter (best-effort — don't fail the request if this fails)
      try {
        const { data: confData, error: confError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          replyTo: TO_EMAIL,
          subject: `We received your message — Linton Business Solutions`,
          html: confirmationHtml,
        });
        if (confError) {
          console.error('Confirmation email error:', confError);
        } else {
          console.log('Confirmation email sent:', confData.id);
        }
      } catch (confErr) {
        console.error('Confirmation email exception:', confErr);
      }

      res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error('Resend error:', err);
      res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to send email' }));
    }
    return;
  }

  // Resend webhook endpoint
  if (req.method === 'POST' && req.url === '/webhook') {
    let rawBody = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', () => {
      const secret = process.env.RESEND_WEBHOOK_SECRET;
      if (secret) {
        const wh = new Webhook(secret);
        try {
          wh.verify(rawBody, {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature'],
          });
        } catch (err) {
          console.error('Webhook signature verification failed:', err.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }
      }

      let event;
      try {
        event = JSON.parse(rawBody);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      console.log('Resend webhook event:', event.type, JSON.stringify(event.data));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    });
    req.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Read error' }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`LBS contact API listening on port ${PORT}`);
});
