#!/usr/bin/env node
/**
 * a11y-check.js
 *
 * Runs axe-core (via @axe-core/playwright) against a representative sample
 * of page templates, served locally by server.js. Prints a per-page summary
 * of violations grouped by impact, plus full detail for serious/critical
 * issues so they can be triaged quickly.
 *
 * Usage:
 *   node scripts/a11y-check.js
 *   node scripts/a11y-check.js --json   # machine-readable output
 *
 * Requires: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers (set below if unset).
 */

'use strict';

process.env.PLAYWRIGHT_BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';

const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const PORT = process.env.A11Y_CHECK_PORT || 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Representative sample of page templates (per audit task scope).
const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'contact.html',
  'shop.html',
  'academy.html',
  'privacy-policy.html', // legal page template
  'software.html',
];

const asJson = process.argv.includes('--json');

function waitForServer(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`${BASE_URL}/index.html`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error('Timed out waiting for local server to start.'));
        } else {
          setTimeout(attempt, 150);
        }
      });
    };
    attempt();
  });
}

async function startServer() {
  const child = spawn('node', [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderrBuf = '';
  child.stderr.on('data', (d) => {
    stderrBuf += d.toString();
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[server] exited early with code ${code}\n${stderrBuf}`);
    }
  });

  await waitForServer(10000);
  return child;
}

async function run() {
  const server = await startServer();

  const results = [];
  let browser, context, page;

  const launchArgs = {
    executablePath: path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium'),
  };

  async function ensureBrowser() {
    if (browser) {
      try {
        await browser.close();
      } catch (_) {
        // ignore — browser may already be dead
      }
    }
    browser = await chromium.launch(launchArgs);
    context = await browser.newContext();
    page = await context.newPage();
  }

  try {
    await ensureBrowser();

    for (const pageFile of PAGES) {
      const url = `${BASE_URL}/${pageFile}`;
      let attempted = false;
      for (let attempt = 0; attempt < 2 && !attempted; attempt++) {
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 20000 });
          const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();

          results.push({
            page: pageFile,
            url,
            violations: axeResults.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              help: v.help,
              helpUrl: v.helpUrl,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                html: n.html,
                failureSummary: n.failureSummary,
              })),
            })),
          });
          attempted = true;
        } catch (err) {
          if (attempt === 0) {
            // Browser/tab may have died — recreate once and retry this page.
            try {
              await ensureBrowser();
            } catch (_) {
              // fall through to record the original error below
            }
          } else {
            results.push({ page: pageFile, url, error: String(err) });
            attempted = true;
          }
        }
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }

  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }

  let totalByImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  for (const r of results) {
    console.log(`\n=== ${r.page} ===`);
    if (r.error) {
      console.log(`  ERROR: ${r.error}`);
      continue;
    }
    if (r.violations.length === 0) {
      console.log('  No violations found.');
      continue;
    }
    for (const v of r.violations) {
      totalByImpact[v.impact] = (totalByImpact[v.impact] || 0) + 1;
      console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
      console.log(`    ${v.helpUrl}`);
      for (const n of v.nodes.slice(0, 3)) {
        console.log(`    - ${n.target.join(' ')}`);
        if (n.failureSummary) {
          console.log(`      ${n.failureSummary.split('\n').join('\n      ')}`);
        }
      }
    }
  }

  console.log('\n=== Summary (violation instances by impact) ===');
  console.log(totalByImpact);

  return results;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
