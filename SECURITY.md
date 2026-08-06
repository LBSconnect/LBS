# Security Overview

This document summarizes a defensive security review of the LBSconnect codebase
(static HTML site + a small Express server, `server.js`) performed against the
OWASP-style checklist below. It is safe to publish: it describes risk classes
and mitigations, not working exploit details, and contains no secrets.

**Scope reviewed:** `server.js`, all `*.html` pages, `assets/js/*.js`,
`assets/courses-src/**`, `package.json` / `package-lock.json`, `render.yaml`,
`.gitignore`, and `tests/*.test.js`. No database, no user accounts, no file
uploads, and no user-generated content is ever rendered back to other users —
this significantly limits the attack surface compared to a typical dynamic
web app.

## Reporting a vulnerability

If you believe you've found a security issue in this site, please email
**info@lbsconnect.net** with a subject line starting `SECURITY:` and a
description of the issue and steps to reproduce. We don't yet have a
dedicated `security@` alias or a formal disclosure SLA — see Finding S-9
below — but reports sent this way will be triaged promptly. Please do not
test against the production site beyond what's needed to demonstrate the
issue, and don't access, modify, or exfiltrate data that isn't your own.

## Severity scale

- **P0** — exploitable now, real secret exposure, or remote code execution.
- **P1** — significant confidentiality/integrity/availability impact, no
  mitigating factor.
- **P2** — real risk but bounded impact, or requires an uncommon precondition
  (e.g. missing defense-in-depth control, no rate limiting).
- **P3** — hygiene / documentation gap / best-practice note, low or no
  practical impact today.

## Summary

No P0 or P1 findings. The most notable gaps are **missing HTTP security
headers** and **no rate limiting** on the three public API routes — both
real, both P2, both fixable with small, low-risk changes proposed below for
Worker 1 to apply to `server.js` (this worker does not edit `server.js`
directly). Everything else checked out clean or is a P3 hygiene note.

| # | Area | Status | Severity |
|---|------|--------|----------|
| 1 | Secrets in source | Clean — no secrets found in tracked files | — |
| 2 | Injection (Stripe path building, path traversal) | Both correctly guarded; traversal now has regression tests | — |
| 3 | XSS (`innerHTML` usage) | All occurrences reviewed; none render attacker-controlled input | — |
| 4 | Security headers | **Missing** (no CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | **P2** |
| 5 | Error handling | Clean — no stack traces / paths / env leakage, now regression-tested | — |
| 6 | Course-access cookie | Correct flags (`HttpOnly`, `Secure`, `SameSite=Lax`); no env-aware toggle, and that's fine | — |
| 7 | Dependency vulnerabilities | 9 advisories via `npm audit`, 3 in the production tree | **P2** (prod), P3 (dev-only) |
| 8 | Rate limiting | **None** on `/api/verify`, `/api/verify-course`, `/api/download` | **P2** |
| 9 | PII in URLs / analytics | Clean — only opaque Stripe session IDs and download tokens appear in URLs | P3 (see note) |

---

## Detailed findings

### 1. Secrets in source — Clean

Grepped the full working tree for Stripe secret-key patterns, generic API
key/password/token assignments, AWS access key IDs, and PEM private key
headers. The only matches were the fake test fixtures
`process.env.STRIPE_SECRET_KEY = 'sk_test_fake'` in `tests/course-access.test.js`
and `tests/download.test.js` — not real keys, only used to satisfy the
"key is configured" check inside the test process.

- `STRIPE_SECRET_KEY` is read exclusively from `process.env.STRIPE_SECRET_KEY`
  (`server.js:189`) — never hardcoded.
- `render.yaml` declares it as `sync: false`, which is Render's correct
  setting for a secret that must be entered manually in the dashboard and
  never committed or synced from a blueprint file.
- `.gitignore` excludes `node_modules/` and `api/node_modules/`.
- `git ls-files | grep -i env` returns nothing — no `.env` file is tracked.

No action needed.

### 2. Injection — Clean, now with regression tests

There's no SQL/NoSQL database, so classic injection is out of scope by
design. Two other injection-adjacent surfaces were checked:

- **Stripe API path building**: `stripeGet()` builds the request path as
  `` `/v1/checkout/sessions/${encodeURIComponent(session_id)}` `` — properly
  encoded. `session_id` is additionally validated to start with `cs_` before
  it's ever used in a Stripe request (both `/api/verify` and
  `/api/verify-course`), so this isn't just encoding-safe, it's shape-checked
  first.
- **`/courses/:slug/*` path traversal**: the handler builds the path with
  `path.normalize(path.join(courseDir, relPath))`, then checks
  `path.relative(courseDir, filePath)` doesn't start with `..` and isn't
  absolute, rejecting with `400` if so. This is the correct pattern.

  Verified live against a locally-run instance with `curl --path-as-is` and
  various encodings (`../`, `%2e%2e%2f`, double-encoded `%252e%252e%252f`)
  targeting `server.js`, `package.json`, `render.yaml`, and `/etc/passwd`.
  All were rejected before authentication even applied (no cookie = redirect
  to `/academy.html`); with a valid cookie, all were rejected with 400/404 by
  the traversal check and never returned file content.

  Added `tests/security-audit.test.js` with a parametrized test
  (`it.each`) covering 5 traversal encodings against an authenticated
  session, asserting the response is never 200 and never contains file
  contents from `server.js`, `/etc/passwd`, or `package.json`. This
  complements the single traversal case already in
  `tests/course-access.test.js`.

No action needed beyond the new tests.

### 3. XSS — Clean

Grepped the entire repo for `.innerHTML` (13 files). Every occurrence was
manually reviewed:

- `assets/courses-src/course-*/player.js` (10 files, same shared helper): a
  small `el()` DOM-builder utility interpolates `attrs.html` into
  `innerHTML`, but every call site passes a **hardcoded string literal**
  from the file's own course content, never user or URL input. Confirmed by
  reading `course-01/player.js` in full — `render()` rebuilds from
  `COURSE_DATA`, a constant defined in the same bundle.
- `course-access.html` and `ba-template-store-download.html`: both build
  HTML strings that interpolate `data.courseName`, `data.templateName`,
  `data.slug`, and `data.token` — but these all come from the JSON response
  of `/api/verify-course` or `/api/verify`, and the server only ever
  populates those fields from **its own hardcoded maps**
  (`COURSE_MAP`, `TEMPLATE_NAMES`, `COURSE_AVAILABLE`) keyed by a slug that
  was already validated against those same maps. There is no path from
  attacker-controlled input (query string, form field, header) into these
  values — the Stripe `client_reference_id` is looked up against the map
  and rejected with 400 if it isn't a recognized key, so it can only ever
  resolve to one of the ~12 known, developer-authored template/course names.
  `data.token` is a `crypto.randomBytes(32).toString('hex')` value — hex
  only, no HTML metacharacters possible.
- `ba-template-store.html`: `grid.innerHTML = MODAL_TEMPLATES.map(...)` —
  `MODAL_TEMPLATES` is a hardcoded in-page constant, not user input.

**Conclusion**: the "no user input is ever rendered back into HTML" premise
holds under review, not just by assumption. There is no reflected or stored
XSS vector in this codebase today. If this ever changes (e.g. a future
feature echoes a URL parameter or form field into the DOM), that call site
would need explicit escaping or `textContent` — flagging this as a design
invariant worth preserving, not a task-list item.

No action needed.

### 4. Security headers — Missing (confirmed) — **P2**

Curled a locally-started instance (`server.js`, no `STRIPE_SECRET_KEY` set)
for both a static page and an API route:

```
GET /index.html            → 200, headers: X-Powered-By, Accept-Ranges,
                              Cache-Control, Last-Modified, ETag, Content-Type
GET /api/verify?session_id=… → 503, headers: X-Powered-By, Content-Type
GET /health                 → 200, headers: X-Powered-By, Content-Type
```

None of these carry `X-Content-Type-Options`, `X-Frame-Options` /
`frame-ancestors`, `Referrer-Policy`, or a `Content-Security-Policy`. (Note:
Express's default 404/500 error pages, via the `finalhandler` package,
happen to set `Content-Security-Policy: default-src 'none'` and
`X-Content-Type-Options: nosniff` on *their own generated error HTML* — this
is a `finalhandler` built-in for its own page, not something the app
configures, and it does **not** apply to normal 200 responses. Don't mistake
it for app-wide header coverage.)

`X-Powered-By: Express` is also present on every response — a harmless but
unnecessary fingerprinting header that costs nothing to remove
(`app.disable('x-powered-by')`).

**HSTS note**: Render terminates TLS in front of this Node process (the app
itself only ever sees plain HTTP internally). `Strict-Transport-Security`
is most correctly configured at Render's edge, not in Express — check
Render's dashboard for an HSTS/custom-headers setting on this service. It's
harmless to also set it in Express as a safety net (Render forwards
whatever headers the app sends), but the edge/CDN setting is the one that
actually matters if Express is ever bypassed or misconfigured.

**Proposed fix** (for Worker 1 / orchestrator to apply — this worker does
not edit `server.js`):

```diff
--- a/server.js
+++ b/server.js
@@
 const PORT = process.env.PORT || 3000;
 const app  = express();
 
+// ── Baseline security headers ─────────────────────────────────────────────────
+// Plain res.setHeader keeps the dependency footprint at zero; this app has a
+// small, stable set of headers to manage. Revisit with `helmet` if the list
+// grows or the CSP needs to get more nuanced than what's below.
+app.disable('x-powered-by');
+app.use((req, res, next) => {
+  res.setHeader('X-Content-Type-Options', 'nosniff');
+  res.setHeader('X-Frame-Options', 'DENY');
+  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
+  // NOTE: 'unsafe-inline' is required today because several pages (e.g.
+  // course-access.html, ba-template-store-download.html) use inline
+  // <script> blocks and inline event handlers. This CSP still blocks
+  // externally-injected <script src> and framing, which is the bulk of the
+  // real-world benefit. Tightening to a nonce/hash-based policy is a
+  // separate, larger effort that touches every HTML page (Worker 2 territory)
+  // — flagged here as a follow-up, not blocking this baseline.
+  res.setHeader(
+    'Content-Security-Policy',
+    "default-src 'self'; " +
+    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
+    "style-src 'self' 'unsafe-inline'; " +
+    "img-src 'self' data: https://www.google-analytics.com; " +
+    "connect-src 'self' https://www.google-analytics.com; " +
+    "frame-ancestors 'none'; " +
+    "base-uri 'self'; " +
+    "form-action 'self' https://formspree.io"
+  );
+  // Render terminates TLS at the edge — confirm HSTS is set there too.
+  // Setting it here is a harmless, cheap safety net either way.
+  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
+  next();
+});
+
 // ── Protected files ───────────────────────────────────────────────────────────
 // BA template .docx and bundle .zip are only served via /api/download.
 // This middleware must come before express.static().
```

**Verify before merging**: `script-src`/`connect-src`/`img-src` allowlist
above assumes Google Analytics/GA4 (`gtag`) is the only third-party script
in use (confirmed via `assets/js/analytics.js`); if Formspree's own
client-side widget or any other third-party script/font is loaded on any
page, its origin needs adding or the CSP will silently break that feature.
Test every page after applying, not just the API routes.

### 5. Error handling — Clean, now regression-tested

Reviewed every `res.status(...).json(...)`/`res.status(...).send(...)` call
and every `catch` block in `server.js`. All error paths return static,
pre-written strings (`'Invalid session.'`, `'Purchase session not found.'`,
`'Verification failed. Please refresh the page or contact
info@lbsconnect.net.'`, etc.) — never `err.message`, `err.stack`, or
template-interpolated exception content into the HTTP response.
`console.error('Stripe verify error:', err.message)` logs to the server's
own stdout/stderr only, which is correct (ops visibility) and never reaches
the client.

Live-tested against a local instance: missing/malformed `session_id`,
missing/invalid download `token`, unknown course slug, and an unmatched
route — all returned clean, generic messages with no stack trace, no
absolute file paths, and no environment variable names or values.

Added a test in `tests/security-audit.test.js` that additionally forces the
`JSON.parse` catch path inside `stripeGet()` (by mocking Stripe to return
invalid JSON) and confirms the resulting 502 response is still the generic
message, not the `SyntaxError` text or any file-path fragment.

No action needed.

### 6. Cookies — Correct, one dev-experience note

`/api/verify-course` sets the course-access cookie with:

```js
res.cookie(`course_${slug}`, token, {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  maxAge: COURSE_TOKEN_TTL,
  path: `/courses/${slug}`,
});
```

This is correct and sufficient: `httpOnly` blocks JS/DOM access to the
token (mitigates XSS-driven theft, though we found no XSS vector anyway),
`secure` ensures it's never sent over plain HTTP, `sameSite: 'Lax'` gives
solid CSRF protection for a cookie that only gates GET requests, and scoping
`path` to the specific course prevents one course's cookie from being sent
on requests for another course.

`secure: true` is hardcoded with no environment-aware toggle (e.g.
`secure: process.env.NODE_ENV === 'production'`). **This is actually fine,
not a bug**: Render serves the production site over HTTPS, so `secure: true`
is correct there. The only effect of the hardcoding is that a developer
running `node server.js` locally over plain `http://localhost` will find the
browser silently refuses to store/send the cookie (browsers don't persist
`Secure` cookies on insecure origins), so the course-unlock flow won't
appear to work in local HTTP dev. This is a minor developer-experience note,
not a security finding — the secure default should not be weakened to fix
it. If local testing of this flow is needed, use `https` locally (e.g. via a
local reverse proxy) or a `curl`/supertest-based test (as the existing test
suite already does, since supertest doesn't enforce the browser's Secure-cookie
same-origin rule).

No action recommended (leave as-is).

### 7. Dependency vulnerabilities — **P2** (production tree), P3 (dev-only)

Ran `npm audit` locally (read-only, `--json` and human-readable) against the
committed `package-lock.json`. Found 9 advisories (1 low, 3 moderate, 5
high). Split by whether the affected package is reachable from the
production dependency tree (`express` is the only direct production
dependency):

**In the production tree (via `express`) — worth fixing promptly:**

| Package | Installed | Vulnerable range | Severity | Advisory |
|---|---|---|---|---|
| `qs` (via `express`/`body-parser`) | 6.14.2 | 6.11.1 – 6.15.1 | moderate | GHSA-q8mj-m7cp-5q26 (DoS via `qs.stringify`) |
| `body-parser` (express dep) | 1.20.4 | ≤1.20.5 | low/moderate | GHSA-v422-hmwv-36x6 (size-limit bypass under invalid `limit`) |
| `path-to-regexp` (express dep) | 0.1.12 | <0.1.13 | high | GHSA-37ch-88jc-xwx2 (ReDoS via route params) |
| `express` itself | 4.22.1 | flagged as depending on vulnerable `qs` | moderate | (transitive, resolved by the `qs` fix) |

All four are **denial-of-service class** (ReDoS / resource exhaustion /
size-limit bypass), not RCE or data exposure — appropriately P2, not P0/P1,
but real on a public-facing server. `npm audit fix` (non-forced) reports a
fix available for all of them and, since express's own `package.json`
constraints (`body-parser: ~1.20.3`, `path-to-regexp: ~0.1.12`) already
allow the patched patch-versions, this should resolve without a major
version bump or breaking change. **Recommend running `npm audit fix` and
re-running the full test suite (`npx jest --runInBand`) to confirm no
regressions**, then committing the updated `package-lock.json`.

**Dev-only (via `jest`/`nock`/`supertest`, never shipped to production) —
lower priority:**

`@babel/core` (low, arbitrary file read via sourcemap comment — a build-time
tool concern, not runtime), `brace-expansion` (high, ReDoS — a test-tooling
transitive dep), `js-yaml` (high, quadratic DoS — same), `picomatch` (high,
ReDoS/glob matching — same), `form-data` (high, CRLF injection — pulled in
by a test dependency's HTTP client, never used by `server.js` itself). These
don't ship to Render (only `dependencies`, not `devDependencies`, get
installed there under a typical `npm install --omit=dev` or Render's default
build), so they're P3: worth cleaning up via `npm audit fix` at the same
time for hygiene, but not a production exposure.

**Coordination note**: I could not find a `worker-1` branch pushed to the
remote at the time of this review (`git branch -a` only showed
`site-audit-2026-08-06` and a handful of unrelated feature branches), so I
can't confirm whether Worker 1 has already applied `npm audit fix`
independently. Reporting this as **still-open** — if Worker 1's branch
already includes the fix by merge time, this section is redundant and can be
dropped rather than duplicated.

### 8. Rate limiting — **None, confirmed** — **P2**

`/api/verify`, `/api/verify-course`, and `/api/download` have no rate
limiting, throttling, or abuse protection of any kind — confirmed by reading
`server.js` in full (no rate-limit middleware imported or applied) and by
issuing repeated requests locally with no `429` or slowdown observed.

Impact: `/api/verify` and `/api/verify-course` each make a real outbound
call to the Stripe API per unrecognized `session_id` (only short-circuited
for already-verified sessions), so an unauthenticated actor can drive
unbounded outbound Stripe API traffic from this server merely by requesting
`/api/verify?session_id=cs_<anything starting with cs_>` repeatedly — a
moderate resource-exhaustion / cost/availability concern, not a data
exposure one (Stripe will simply 404/error on made-up session IDs, so no
valid tokens are minted from guesses; the risk is volume/cost/noise, not
unauthorized access). `/api/download` doesn't call Stripe but still streams
files from disk per request with no cap.

**Proposed fix** (for Worker 1 / orchestrator — this worker does not edit
`server.js`):

```diff
--- a/server.js
+++ b/server.js
@@
 const PORT = process.env.PORT || 3000;
 const app  = express();
 
+// Render sits in front of this app as a reverse proxy. Without this,
+// express-rate-limit (and anything else keying off req.ip) sees Render's
+// proxy address for every request, which either disables per-client limiting
+// entirely or — worse — applies one shared limit across all real users.
+app.set('trust proxy', 1);
+
```

```diff
--- a/server.js
+++ b/server.js
@@
+const rateLimit = require('express-rate-limit'); // npm i express-rate-limit
+
+// Shared limiter for the three public API routes. 30 req / 15 min / IP is
+// generous for a legitimate buyer (verify happens once per purchase, retried
+// a handful of times at most; download is re-fetched occasionally within the
+// 24h token window) while capping abuse. Tune based on real traffic once
+// this ships — start conservative, loosen if legitimate users get throttled.
+const apiLimiter = rateLimit({
+  windowMs: 15 * 60 * 1000,
+  max: 30,
+  standardHeaders: true,
+  legacyHeaders: false,
+  message: { error: 'Too many requests. Please try again in a few minutes.' },
+});
+
 // ── GET /api/verify?session_id=cs_xxx ────────────────────────────────────────
 // Verifies a completed Stripe checkout session and returns a download token.
 // The same session always returns the same token within its 24-hour window.
-app.get('/api/verify', async (req, res) => {
+app.get('/api/verify', apiLimiter, async (req, res) => {
```

(and the same `apiLimiter` middleware added to the `/api/verify-course` and
`/api/download` route definitions). This is a small, well-maintained package
(`express-rate-limit`) — recommending it over a hand-rolled in-memory limiter
since correct sliding-window behavior and IP-key handling (especially with
`trust proxy`) are easy to get subtly wrong by hand, and this route set is
small enough that a single shared limiter instance is sufficient (no need
for per-route tuning yet).

### 9. Analytics / URL privacy — Clean, one P3 note

Checked the full purchase → verify → download flow and grepped for
`email`/PII-shaped query params across all HTML pages.

- `session_id` (Stripe checkout session ID, format `cs_...`) appears in the
  URL for `course-access.html?session_id=...` and the template download
  page. This is an **opaque, server-generated identifier** — it is not
  itself PII (no name/email encoded in it), though it is a capability token
  in the sense that whoever holds it can call `/api/verify(-course)` for
  that purchase. Stripe checkout session IDs are designed to be shared this
  way (it's literally how Stripe's own `success_url` redirect works) and
  expire/are single-purchase-scoped.
- `gaTrackPurchaseOnce()` (`assets/js/analytics.js`) sends `transaction_id:
  sessionId` to GA4 as an event parameter — same opaque ID, no email or name
  is ever passed into `gtag()` anywhere in the codebase (grepped for
  `email` across all `*.html`; only matches are `mailto:info@lbsconnect.net`
  contact links and legal-page prose, not analytics calls).
- `/api/download?token=...` — the download token is a
  `crypto.randomBytes(32).toString('hex')` bearer credential carried in a
  URL query string. This is a general anti-pattern (URLs land in server
  access logs, browser history, and `Referer` headers if a page ever links
  out from a download page) but the practical exposure here is narrow: the
  token is scoped to a single purchased file (or bundle), expires in 24h,
  and this app has no outbound links *from* the download page to third-party
  origins that would carry it via `Referer`. **P3** — noting it as a known
  trade-off of the "no accounts, no backend session store" design rather
  than something to fix now; if this ever needs hardening, the standard
  approach is a short-lived POST-based exchange or an `Authorization` header
  instead of a query param, which would require client-side changes beyond
  this worker's scope.

No action required beyond the note above.

---

## Test coverage added

`tests/security-audit.test.js` (new file, additive — does not modify
`tests/course-access.test.js` or `tests/download.test.js`) adds:

- Path traversal rejected across 5 different encodings under an
  authenticated session (parametrized with `it.each`), asserting non-200 and
  no leaked file content.
- Confirmation a legitimate authenticated request still succeeds (negative
  control, so the traversal tests aren't accidentally passing because
  *everything* 404s).
- Error responses (`/api/verify`, `/api/verify-course`, `/api/download`,
  unmatched routes, and a forced Stripe-JSON-parse-failure path) never
  contain stack-frame signatures or the repo's absolute path.
- Course-access cookie carries `HttpOnly`, `Secure`, `SameSite=Lax`, a
  course-scoped `Path`, and a long `Max-Age`.
- Protected downloadable assets (`ba-template-*.docx`, the bundle `.zip`,
  both AI prompt library PDFs) return 403 when requested directly, never
  falling through to static file serving.

All 84 tests (68 pre-existing + 16 new) pass:
`npx jest --runInBand` → `Test Suites: 3 passed, 3 total`.

## Items requiring business-owner awareness

- **Responsible-disclosure contact**: there was no dedicated `security@`
  address or disclosure policy before this document. `info@lbsconnect.net`
  is used above as the interim contact since it's the only monitored inbox
  in the codebase. Consider a dedicated `security@lbsconnect.net` alias if
  this site's risk profile grows (e.g. accounts, payments beyond
  Stripe-hosted checkout).
- **CSP allowlist** (Finding 4) was built from what's referenced in the
  codebase today (Google Analytics/GA4, Formspree form action). If any
  other third-party script, font, or embed is added to any page without
  updating the CSP, that feature will silently break — this needs a
  changelog/review step, not just a one-time fix.
- **Rate-limit thresholds** (Finding 8) are a starting guess (30 req/15min/IP).
  Should be tuned against real traffic after shipping, and Render's
  `trust proxy` requirement must not be skipped or the limiter will
  misbehave.
