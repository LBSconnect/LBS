'use strict';

/**
 * Shared helpers for the LBS e2e suite.
 *
 * Design notes:
 * - The site pulls Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
 *   and Google Analytics (googletagmanager.com / google-analytics.com) from
 *   the public internet on every page. In this sandboxed CI environment
 *   those hosts are unreachable (or reachable only slowly/flakily through a
 *   proxy), which would make "zero console errors / zero failed requests"
 *   assertions non-deterministic through no fault of the site. We
 *   intentionally intercept requests to those specific hosts and fulfill
 *   them with a benign empty response (rather than abort()ing, which itself
 *   produces a browser "Failed to load resource" console error we can't
 *   reliably attribute back to the blocked host — Chromium's console message
 *   text carries no URL) so every test run is fast and deterministic
 *   regardless of outbound network conditions. This is a test-harness
 *   concession, not evidence the site is broken — every request to the
 *   app's own origin is still fully asserted on.
 * - Formspree (contact form target) and Stripe checkout links are never hit
 *   in this suite; see contact.spec.js and shop-academy-store.spec.js for
 *   how each avoids a real submission/navigation.
 */

const EXPECTED_BLOCKED_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
];

const EXPECTED_BLOCKED_RE = new RegExp(
  `^https:\\/\\/(${EXPECTED_BLOCKED_HOSTS.map((h) => h.replace(/\./g, '\\.')).join('|')})\\/`
);

/**
 * Installs console/network tracking on `page` and blocks the known-benign
 * external hosts above. Returns an object with `consoleErrors` and
 * `failedRequests` arrays that fill in as the test runs, plus
 * `assertClean()` to call at the end of a test.
 */
function trackPage(page) {
  // Fulfill the external, non-deterministic hosts with an inert empty
  // response before anything else (see file header for why not abort()).
  page.route(EXPECTED_BLOCKED_RE, (route) => {
    const url = route.request().url();
    const contentType = /\.css(\?|$)/.test(url)
      ? 'text/css'
      : 'application/javascript';
    route.fulfill({ status: 200, contentType, body: `/* blocked in test env: ${url} */` });
  });

  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[console] ${page.url()} :: ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[pageerror] ${page.url()} :: ${err.message}`);
  });

  page.on('requestfailed', (req) => {
    if (EXPECTED_BLOCKED_RE.test(req.url())) return; // intentionally aborted
    failedRequests.push(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText}`);
  });

  page.on('response', (res) => {
    if (EXPECTED_BLOCKED_RE.test(res.url())) return;
    if (res.status() >= 400) {
      failedRequests.push(`[http ${res.status()}] ${res.url()}`);
    }
  });

  return {
    consoleErrors,
    failedRequests,
    assertClean() {
      if (consoleErrors.length) {
        throw new Error(`Unexpected console errors:\n${consoleErrors.join('\n')}`);
      }
      if (failedRequests.length) {
        throw new Error(`Unexpected failed/4xx-5xx requests:\n${failedRequests.join('\n')}`);
      }
    },
  };
}

// Top-level header nav: [href, link text, expected <h1> substring or regex].
// Order matches the markup in the <nav class="nav"> / <nav class="nav__mobile">
// blocks shared across every page (see assets/js/main.js + any *.html header).
const NAV_LINKS = [
  { href: 'index.html', text: 'Home', h1: /Modernize Your/i },
  { href: 'shop.html', text: 'BA Shop', h1: /LBS Shop/i },
  { href: 'academy.html', text: 'BA Academy', h1: /Online Business Analysis Training/i },
  { href: 'services.html', text: 'BA Consulting', h1: /Fixed Scope/i },
  { href: 'software.html', text: 'Software', h1: /Software Built/i },
  { href: 'portfolio.html', text: 'Portfolio', h1: /Clients Served/i },
  { href: 'contact.html', text: 'Contact', h1: /Let's Talk About/i },
];

// Spot-check (>=5 of ~20) of legal.html's outbound links, one from each
// legal-index section so the sample isn't clustered in a single policy family.
const LEGAL_SPOT_CHECK_LINKS = [
  'privacy-policy.html',
  'cookie-policy.html',
  'accessibility-statement.html',
  'lbsconnect-website-shop-terms.html',
  'myeasypass-terms.html',
  'workabeez-terms.html',
];

module.exports = {
  trackPage,
  NAV_LINKS,
  LEGAL_SPOT_CHECK_LINKS,
  EXPECTED_BLOCKED_RE,
};
