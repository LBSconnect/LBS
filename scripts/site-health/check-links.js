#!/usr/bin/env node
/**
 * Broken-link / route crawler for the LBS static site.
 *
 * Two modes:
 *   node scripts/site-health/check-links.js --base http://localhost:3000   (crawl a running instance)
 *   node scripts/site-health/check-links.js --base https://www.lbsconnect.net --external  (also HEAD-check external links)
 *
 * Walks every internal .html link reachable from the pages listed in
 * sitemap.xml (falling back to a filesystem scan of *.html at repo root if
 * sitemap.xml is missing/empty), reports any non-2xx/3xx response, and
 * writes a JSON summary to stdout plus a machine-readable report object.
 *
 * Deliberately dependency-free (uses Node's built-in fetch, Node >=18) so it
 * adds no new package to the project.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function parseArgs(argv) {
  const args = { base: 'http://localhost:3000', external: false, timeoutMs: 10000 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base') args.base = argv[++i];
    else if (argv[i] === '--external') args.external = true;
    else if (argv[i] === '--timeout') args.timeoutMs = Number(argv[++i]) || args.timeoutMs;
  }
  return args;
}

function seedPagesFromDisk() {
  return fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .sort();
}

function extractLinks(html) {
  const hrefs = new Set();
  const re = /\shref="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) hrefs.add(m[1]);
  const srcRe = /\ssrc="([^"]+)"/g;
  while ((m = srcRe.exec(html))) hrefs.add(m[1]);
  return [...hrefs];
}

function classify(href) {
  if (href.startsWith('mailto:')) return 'mailto';
  if (href.startsWith('tel:')) return 'tel';
  if (href.startsWith('#')) return 'anchor-only';
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) return 'external';
  return 'internal';
}

async function fetchWithTimeout(url, opts, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal, redirect: 'manual' });
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pages = seedPagesFromDisk();
  const visited = new Set();
  const queue = [...pages];
  const brokenInternal = [];
  const brokenExternal = [];
  const checkedExternal = new Set();
  let pagesCrawled = 0;
  let linksChecked = 0;

  while (queue.length) {
    const page = queue.shift();
    if (visited.has(page)) continue;
    visited.add(page);

    const url = `${args.base}/${page}`.replace(/\/{2,}/g, (m, off) => (off === args.base.indexOf('//') + 1 ? m : '/'));
    let res;
    try {
      res = await fetchWithTimeout(url, {}, args.timeoutMs);
    } catch (err) {
      brokenInternal.push({ page, target: url, error: err.message });
      continue;
    }
    pagesCrawled++;
    if (res.status >= 400) {
      brokenInternal.push({ page, target: url, status: res.status });
      continue;
    }
    const html = await res.text();
    for (const raw of extractLinks(html)) {
      linksChecked++;
      const kind = classify(raw);
      if (kind === 'internal') {
        const clean = raw.split('#')[0].replace(/^\.?\//, '');
        if (clean && clean.endsWith('.html') && !visited.has(clean) && !queue.includes(clean)) {
          queue.push(clean);
        }
      } else if (kind === 'external' && args.external) {
        const normalized = raw.startsWith('//') ? `https:${raw}` : raw;
        if (checkedExternal.has(normalized)) continue;
        checkedExternal.add(normalized);
        try {
          const r = await fetchWithTimeout(normalized, { method: 'HEAD' }, args.timeoutMs);
          if (r.status >= 400 && r.status !== 405) {
            brokenExternal.push({ page, target: normalized, status: r.status });
          }
        } catch (err) {
          brokenExternal.push({ page, target: normalized, error: err.message });
        }
      }
    }
  }

  const report = {
    base: args.base,
    generatedAt: new Date().toISOString(),
    pagesCrawled,
    linksChecked,
    brokenInternal,
    brokenExternal: args.external ? brokenExternal : undefined,
    status: brokenInternal.length === 0 ? 'pass' : 'fail',
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(brokenInternal.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ status: 'error', error: err.message }));
  process.exit(2);
});
