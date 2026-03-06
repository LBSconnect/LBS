'use strict';

const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const TO_EMAIL = 'info@lbsconnect.net';
const PORT = process.env.PORT || 3000;

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY environment variable is required');
  process.exit(1);
}
if (!FROM_EMAIL) {
  console.error('ERROR: RESEND_FROM_EMAIL environment variable is required');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);
const app = express();

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Serve static files from repo root
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { first_name, last_name, email, phone, organization, package: pkg, message, timeline } = req.body || {};

  if (!first_name || !last_name || !email || !message) {
    return res.status(422).json({ error: 'Missing required fields' });
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

  const eName = `${escHtml(first_name)} ${escHtml(last_name)}`;
  const eEmail = escHtml(email);
  const ePhone = phone ? escHtml(phone) : '';
  const eOrg = organization ? escHtml(organization) : '';
  const eMsg = escHtml(message);
  const ePkg = pkg ? escHtml(packageLabels[pkg] || pkg) : '';
  const eTimeline = timeline ? escHtml(timelineLabels[timeline] || timeline) : '';

  const emailHtml = `
<h2>New Contact Form Submission</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
  <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${eName}</td></tr>
  <tr><td style="font-weight:bold;padding-right:16px;">Email</td><td><a href="mailto:${eEmail}">${eEmail}</a></td></tr>
  ${ePhone ? `<tr><td style="font-weight:bold;padding-right:16px;">Phone</td><td>${ePhone}</td></tr>` : ''}
  ${eOrg ? `<tr><td style="font-weight:bold;padding-right:16px;">Company / Organization</td><td>${eOrg}</td></tr>` : ''}
  ${ePkg ? `<tr><td style="font-weight:bold;padding-right:16px;">Package</td><td>${ePkg}</td></tr>` : ''}
  ${eTimeline ? `<tr><td style="font-weight:bold;padding-right:16px;">Timeline</td><td>${eTimeline}</td></tr>` : ''}
</table>
<h3 style="margin-top:24px;">Message</h3>
<p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${eMsg}</p>
`;

  const confirmationHtml = `
<div style="font-family:sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;">
  <h2 style="color:#1a3a5c;">We received your message, ${escHtml(first_name)}!</h2>
  <p>Thank you for reaching out to <strong>Linton Business Solutions</strong>. We've received your inquiry and will get back to you within <strong>1 business day</strong>.</p>
  <h3 style="color:#1a3a5c;margin-top:24px;">Your submission summary</h3>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${eName}</td></tr>
    ${ePhone ? `<tr><td style="font-weight:bold;padding-right:16px;">Phone</td><td>${ePhone}</td></tr>` : ''}
    ${eOrg ? `<tr><td style="font-weight:bold;padding-right:16px;">Company / Organization</td><td>${eOrg}</td></tr>` : ''}
    ${ePkg ? `<tr><td style="font-weight:bold;padding-right:16px;">Package Interest</td><td>${ePkg}</td></tr>` : ''}
    ${eTimeline ? `<tr><td style="font-weight:bold;padding-right:16px;">Timeline</td><td>${eTimeline}</td></tr>` : ''}
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

    // Confirmation to submitter (best-effort)
    try {
      const { data: confData, error: confError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        replyTo: TO_EMAIL,
        subject: 'We received your message — Linton Business Solutions',
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

    res.json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LBS server listening on port ${PORT}`);
  });
}

module.exports = app;
