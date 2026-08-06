#!/usr/bin/env node
/**
 * responsive-check.js
 *
 * Loads a set of pages at the required viewport widths and flags common
 * responsive-layout bugs: horizontal overflow, and (on mobile widths)
 * whether interactive elements meet a 44x44px touch-target minimum. Also
 * exercises the mobile-nav toggle at a mobile width. Screenshots a small
 * set of width/page combos to test-artifacts/a11y-responsive/.
 *
 * Findings print as they're found (not buffered to the end) so a crashed
 * browser mid-run still leaves useful output.
 *
 * Usage: node scripts/responsive-check.js
 */

'use strict';

process.env.PLAYWRIGHT_BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';

const path = require('path');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const PORT = process.env.RESPONSIVE_CHECK_PORT || 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACT_DIR = path.join(__dirname, '..', 'test-artifacts', 'a11y-responsive');
const SCREENSHOT_WIDTHS = [320, 375, 1440];

const WIDTHS = [320, 375, 430, 768, 1024, 1280, 1440, 1920];
const PAGES = ['index.html', 'services.html', 'contact.html', 'academy.html'];

function waitForServer(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`${BASE_URL}/index.html`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error('server did not start'));
        else setTimeout(attempt, 150);
      });
    };
    attempt();
  });
}

async function startServer() {
  const child = spawn('node', [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });
  await waitForServer(10000);
  return child;
}

let browser, context, page;

async function ensureBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch (_) {
      /* ignore */
    }
  }
  browser = await chromium.launch({
    executablePath: path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium'),
  });
  context = await browser.newContext();
  page = await context.newPage();
}

async function withRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    await ensureBrowser();
    return await fn();
  }
}

async function run() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const server = await startServer();
  const findings = [];

  function record(f) {
    findings.push(f);
    console.log(JSON.stringify(f));
  }

  try {
    await ensureBrowser();

    for (const pageFile of PAGES) {
      for (const width of WIDTHS) {
        await withRetry(async () => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`${BASE_URL}/${pageFile}`, { waitUntil: 'load', timeout: 20000 });

          const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          if (overflow.scrollWidth > overflow.clientWidth + 1) {
            record({
              page: pageFile,
              width,
              issue: 'horizontal-overflow',
              detail: `scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`,
            });
          }

          if (width <= 430) {
            const small = await page.evaluate(() => {
              const selectors = 'a, button, input, select, textarea, [role="button"]';
              const els = Array.from(document.querySelectorAll(selectors));
              const bad = [];
              for (const el of els) {
                const style = getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') continue;
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) continue;
                if (rect.width < 44 || rect.height < 44) {
                  bad.push({
                    tag: el.tagName.toLowerCase(),
                    id: el.id || null,
                    cls: el.className && el.className.toString().slice(0, 60),
                    w: Math.round(rect.width),
                    h: Math.round(rect.height),
                    text: (el.textContent || '').trim().slice(0, 30),
                  });
                }
              }
              return bad;
            });
            if (small.length) {
              record({ page: pageFile, width, issue: 'small-touch-target', detail: small.slice(0, 15) });
            }
          }

          if (SCREENSHOT_WIDTHS.includes(width)) {
            const shotPath = path.join(ARTIFACT_DIR, `${pageFile.replace('.html', '')}-${width}.png`);
            await page.screenshot({ path: shotPath });
          }
        });
      }
    }

    // Mobile-nav toggle smoke test at 375px on index.html.
    await withRetry(async () => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'load' });
      const toggle = page.locator('#nav-toggle');
      const beforeExpanded = await toggle.getAttribute('aria-expanded');
      await toggle.click();
      const afterExpanded = await toggle.getAttribute('aria-expanded');
      const mobileNavVisible = await page.locator('#nav-mobile').evaluate((el) => {
        const s = getComputedStyle(el);
        return s.display !== 'none' && s.opacity !== '0';
      });
      record({
        page: 'index.html',
        width: 375,
        issue: 'mobile-nav-toggle-check',
        detail: { beforeExpanded, afterExpanded, mobileNavVisible },
      });

      const toggleBox = await toggle.boundingBox();
      record({ page: 'index.html', width: 375, issue: 'nav-toggle-hit-area', detail: toggleBox });
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (_) {
        /* ignore */
      }
    }
    server.kill();
  }

  const overflowIssues = findings.filter((f) => f.issue === 'horizontal-overflow');
  const touchIssues = findings.filter((f) => f.issue === 'small-touch-target');
  console.log(`\n=== Summary ===`);
  console.log(`Horizontal overflow instances: ${overflowIssues.length}`);
  console.log(`Small-touch-target instances (<=430px): ${touchIssues.length}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
