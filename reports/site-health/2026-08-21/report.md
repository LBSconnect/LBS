# Weekly Site Health Report — 2026-08-21

**Overall status:** ✅ PASS
**Production URL tested:** https://www.lbsconnect.net
**Commit tested:** `29a0877d9b08b079eebfd76d5f04d2c9a7aa8207`
**Run started:** 2026-08-21T05:24:07Z
**Report generated:** 2026-08-21T05:25:10.547Z

## Comparison to Previous Baseline

No previous baseline found — this is the first recorded run.

## Broken Links / Routes

Pages crawled: 37. Links checked: 1193. Broken: **0**.

None found.

## Dependency / Security (npm audit)

Total: 0 (critical: 0, high: 0, moderate: 0, low: 0)

## Unit / Integration Tests (jest)

```
failed. Please refresh the page or contact info@lbsconnect.net.'[39m })[33m;[39m
     [90m 367 |[39m   }
     [90m 368 |[39m })[33m;[39m[0m

      at error (server.js:365:13)

    console.error
      Stripe verify-course error: ECONNRESET: connection reset

    [0m [90m 435 |[39m     [36mreturn[39m grantAccess(slug[33m,[39m token)[33m;[39m
     [90m 436 |[39m   } [36mcatch[39m (err) {
    [31m[1m>[22m[39m[90m 437 |[39m     console[33m.[39merror([32m'Stripe verify-course error:'[39m[33m,[39m err[33m.[39mmessage)[33m;[39m
     [90m     |[39m             [31m[1m^[22m[39m
     [90m 438 |[39m     [36mreturn[39m res[33m.[39mstatus([35m502[39m)[33m.[39mjson({ error[33m:[39m [32m'Verification failed. Please refresh the page or contact info@lbsconnect.net.'[39m })[33m;[39m
     [90m 439 |[39m   }
     [90m 440 |[39m })[33m;[39m[0m

      at error (server.js:437:13)

    console.error
      Stripe verify error: socket hang up

    [0m [90m 363 |[39m     })[33m;[39m
     [90m 364 |[39m   } [36mcatch[39m (err) {
    [31m[1m>[22m[39m[90m 365 |[39m     console[33m.[39merror([32m'Stripe verify error:'[39m[33m,[39m err[33m.[39mmessage)[33m;[39m
     [90m     |[39m             [31m[1m^[22m[39m
     [90m 366 |[39m     [36mreturn[39m res[33m.[39mstatus([35m502[39m)[33m.[39mjson({ error[33m:[39m [32m'Verification failed. Please refresh the page or contact info@lbsconnect.net.'[39m })[33m;[39m
     [90m 367 |[39m   }
     [90m 368 |[39m })[33m;[39m[0m

      at error (server.js:365:13)

    console.error
      Stripe verify error: Unexpected token 'h', "this is not"... is not valid JSON

    [0m [90m 363 |[39m     })[33m;[39m
     [90m 364 |[39m   } [36mcatch[39m (err) {
    [31m[1m>[22m[39m[90m 365 |[39m     console[33m.[39merror([32m'Stripe verify error:'[39m[33m,[39m err[33m.[39mmessage)[33m;[39m
     [90m     |[39m             [31m[1m^[22m[39m
     [90m 366 |[39m     [36mreturn[39m res[33m.[39mstatus([35m502[39m)[33m.[39mjson({ error[33m:[39m [32m'Verification failed. Please refresh the page or contact info@lbsconnect.net.'[39m })[33m;[39m
     [90m 367 |[39m   }
     [90m 368 |[39m })[33m;[39m[0m

      at error (server.js:365:13)

    console.error
      Stripe verify-course error: Unexpected token '<', "<html>not "... is not valid JSON

    [0m [90m 435 |[39m     [36mreturn[39m grantAccess(slug[33m,[39m token)[33m;[39m
     [90m 436 |[39m   } [36mcatch[39m (err) {
    [31m[1m>[22m[39m[90m 437 |[39m     console[33m.[39merror([32m'Stripe verify-course error:'[39m[33m,[39m err[33m.[39mmessage)[33m;[39m
     [90m     |[39m             [31m[1m^[22m[39m
     [90m 438 |[39m     [36mreturn[39m res[33m.[39mstatus([35m502[39m)[33m.[39mjson({ error[33m:[39m [32m'Verification failed. Please refresh the page or contact info@lbsconnect.net.'[39m })[33m;[39m
     [90m 439 |[39m   }
     [90m 440 |[39m })[33m;[39m[0m

      at error (server.js:437:13)

PASS tests/security-audit.test.js
  ● Console

    console.error
      Stripe verify error: Unexpected token 'o', "not json{{{" is not valid JSON

    [0m [90m 363 |[39m     })[33m;[39m
     [90m 364 |[39m   } [36mcatch[39m (err) {
    [31m[1m>[22m[39m[90m 365 |[39m     console[33m.[39merror([32m'Stripe verify error:'[39m[33m,[39m err[33m.[39mmessage)[33m;[39m
     [90m     |[39m             [31m[1m^[22m[39m
     [90m 366 |[39m     [36mreturn[39m res[33m.[39mstatus([35m502[39m)[33m.[39mjson({ error[33m:[39m [32m'Verification failed. Please refresh the page or contact info@lbsconnect.net.'[39m })[33m;[39m
     [90m 367 |[39m   }
     [90m 368 |[39m })[33m;[39m[0m

      at error (server.js:365:13)


Test Suites: 4 passed, 4 total
Tests:       110 passed, 110 total
Snapshots:   0 total
Time:        2.108 s
Ran all test suites.

```

## End-to-End Tests (Playwright)

```
ile navigation › a mobile-nav link navigates to the right page and closes the drawer 
    [desktop-chromium] › e2e/not-found.e2e.js:4:3 › Nonexistent page › returns a non-500 status and the server keeps responding afterward 
    [desktop-chromium] › e2e/shop-academy-store.e2e.js:10:3 › Shop page › loads without console errors and its product category CTAs are present 
    [desktop-chromium] › e2e/shop-academy-store.e2e.js:31:3 › Academy page › loads without console errors and Enroll buttons have a non-empty href 
    [desktop-chromium] › e2e/shop-academy-store.e2e.js:58:3 › BA Template Store page › loads without console errors and Buy/Get buttons have a non-empty href 
    [mobile-chromium] › e2e/contact.e2e.js:5:3 › Contact page › form fields are present ────────────
    [mobile-chromium] › e2e/contact.e2e.js:21:3 › Contact page › required-field browser validation blocks an empty submission 
    [mobile-chromium] › e2e/contact.e2e.js:51:3 › Contact page › filling only some required fields still blocks submission until all are valid 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "Home" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "BA Shop" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "BA Academy" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "BA Consulting" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "Software" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "Portfolio" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/header-nav.e2e.js:12:5 › Header navigation › "Contact" nav link goes to a 200 page with the expected heading 
    [mobile-chromium] › e2e/homepage.e2e.js:5:3 › Homepage › loads with the correct title, no console errors, no failed own-asset requests 
    [mobile-chromium] › e2e/homepage.e2e.js:19:3 › Homepage › root path ("/") also serves the homepage 
    [mobile-chromium] › e2e/legal.e2e.js:5:3 › Legal hub page › legal.html loads with its heading and full link index 
    [mobile-chromium] › e2e/legal.e2e.js:19:5 › Legal hub page › legal link "privacy-policy.html" resolves to a 200 page 
    [mobile-chromium] › e2e/legal.e2e.js:19:5 › Legal hub page › legal link "cookie-policy.html" resolves to a 200 page 
    [mobile-chromium] › e2e/legal.e2e.js:19:5 › Legal hub page › legal link "accessibility-statement.html" resolves to a 200 page 
    [mobile-chromium] › e2e/legal.e2e.js:19:5 › Legal hub page › legal link "lbsconnect-website-shop-terms.html" resolves to a 200 page 
    [mobile-chromium] › e2e/legal.e2e.js:19:5 › Legal hub page › legal link "myeasypass-terms.html" resolves to a 200 page 
    [mobile-chromium] › e2e/legal.e2e.js:19:5 › Legal hub page › legal link "workabeez-terms.html" resolves to a 200 page 
    [mobile-chromium] › e2e/mobile-nav.e2e.js:13:3 › Mobile navigation › hamburger toggle opens and closes the mobile menu 
    [mobile-chromium] › e2e/mobile-nav.e2e.js:39:3 › Mobile navigation › a mobile-nav link navigates to the right page and closes the drawer 
    [mobile-chromium] › e2e/not-found.e2e.js:4:3 › Nonexistent page › returns a non-500 status and the server keeps responding afterward 
    [mobile-chromium] › e2e/shop-academy-store.e2e.js:10:3 › Shop page › loads without console errors and its product category CTAs are present 
    [mobile-chromium] › e2e/shop-academy-store.e2e.js:31:3 › Academy page › loads without console errors and Enroll buttons have a non-empty href 
    [mobile-chromium] › e2e/shop-academy-store.e2e.js:58:3 › BA Template Store page › loads without console errors and Buy/Get buttons have a non-empty href 

```

## Accessibility (axe)

Accessibility check did not run this cycle (or Worker 7's script has not been wired in yet).

## Recommended Human Actions

- Review the linked pull request and merge if the diff is low-risk, or request changes.

