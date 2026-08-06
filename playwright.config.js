'use strict';

const { defineConfig, devices } = require('@playwright/test');

// Scratch port so the e2e run never collides with a dev server someone
// already has open on 3000.
const PORT = process.env.E2E_PORT || 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Playwright's own browser download is disabled in this environment
// (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1) — a Chromium build is pre-installed
// under PLAYWRIGHT_BROWSERS_PATH instead. Point every project at it
// explicitly via executablePath so `npx playwright test` never tries to
// fetch its own copy.
const CHROMIUM_EXECUTABLE =
  process.env.PW_CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

module.exports = defineConfig({
  testDir: './e2e',
  // Explicit (not "*.spec.js"/"*.test.js"): the repo's existing Jest suite
  // (tests/*.test.js) uses Jest's default testMatch, which also globs
  // "**/*.spec.js" repo-wide and would otherwise try (and fail) to load
  // these Playwright-only files. The distinct ".e2e.js" suffix keeps the
  // two runners out of each other's way without touching Jest's config.
  testMatch: '**/*.e2e.js',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        launchOptions: { executablePath: CHROMIUM_EXECUTABLE },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true,
        launchOptions: { executablePath: CHROMIUM_EXECUTABLE },
      },
    },
  ],

  // Self-contained: spin the real server up on a scratch port and tear it
  // down after the run, so `npm run test:e2e` needs nothing pre-running.
  webServer: {
    command: 'node server.js',
    url: BASE_URL,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
