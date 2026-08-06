#!/usr/bin/env node
/**
 * Assembles the dated weekly site-health report from the JSON artifacts
 * produced earlier in the workflow (link check, npm audit, test results)
 * into a single human-readable Markdown file at
 * /reports/site-health/YYYY-MM-DD/report.md, plus writes a baseline.json
 * used to diff against next week's run.
 *
 * Reads inputs from environment variables (set by the calling workflow
 * step) and from JSON files in the working directory. Every input is
 * optional — a missing input is rendered as "not run this cycle" rather
 * than crashing the report, since this script must stay resilient as new
 * checks get added over time.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function readJSON(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function readText(file, fallback = '') {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return fallback;
  }
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

function main() {
  const now = new Date();
  const dateDir = process.env.REPORT_DATE || fmtDate(now);
  const outDir = path.join(ROOT, 'reports', 'site-health', dateDir);
  fs.mkdirSync(outDir, { recursive: true });

  const linkReport = readJSON(path.join(ROOT, 'link-check.json'));
  const auditReport = readJSON(path.join(ROOT, 'npm-audit.json'));
  const testLog = readText(path.join(ROOT, 'test-output.txt'), '(not captured)');
  const e2eLog = readText(path.join(ROOT, 'e2e-output.txt'), '(e2e suite not present in this run)');
  // scripts/a11y-check.js --json outputs an array of {page, url, violations[]}
  // (or {error} per page on a load failure), not a single summary object.
  const a11yResults = readJSON(path.join(ROOT, 'a11y-report.json'));
  const a11yReport = Array.isArray(a11yResults)
    ? {
        pagesChecked: a11yResults.length,
        totalViolations: a11yResults.reduce((sum, r) => sum + (r.violations ? r.violations.length : 0), 0),
        pagesWithErrors: a11yResults.filter((r) => r.error).length,
      }
    : null;
  const commitSha = process.env.GITHUB_SHA || readText(path.join(ROOT, '.git', 'HEAD')).trim() || 'unknown';
  const prodUrl = process.env.PROD_URL || 'https://www.lbsconnect.net';
  const startedAt = process.env.RUN_STARTED_AT || now.toISOString();

  const baselinePath = path.join(ROOT, 'reports', 'site-health', 'baseline.json');
  const previousBaseline = readJSON(baselinePath, null);

  const currentSummary = {
    date: dateDir,
    commit: commitSha,
    linksBroken: linkReport ? linkReport.brokenInternal.length : null,
    auditVulnerabilities: auditReport ? (auditReport.metadata?.vulnerabilities?.total ?? null) : null,
    testsStatus: /Tests:\s+\d+ failed/.test(testLog) ? 'fail' : 'pass',
  };

  let diffSection = 'No previous baseline found — this is the first recorded run.';
  if (previousBaseline) {
    const lines = [];
    if (previousBaseline.linksBroken !== currentSummary.linksBroken) {
      lines.push(`- Broken links: ${previousBaseline.linksBroken ?? 'n/a'} → ${currentSummary.linksBroken ?? 'n/a'}`);
    }
    if (previousBaseline.auditVulnerabilities !== currentSummary.auditVulnerabilities) {
      lines.push(`- npm audit vulnerabilities: ${previousBaseline.auditVulnerabilities ?? 'n/a'} → ${currentSummary.auditVulnerabilities ?? 'n/a'}`);
    }
    if (previousBaseline.testsStatus !== currentSummary.testsStatus) {
      lines.push(`- Test suite status: ${previousBaseline.testsStatus} → ${currentSummary.testsStatus}`);
    }
    diffSection = lines.length ? lines.join('\n') : 'No change from the previous weekly baseline.';
  }

  const md = `# Weekly Site Health Report — ${dateDir}

**Overall status:** ${currentSummary.testsStatus === 'pass' && (linkReport ? linkReport.status === 'pass' : true) ? '✅ PASS' : '⚠️ ATTENTION NEEDED'}
**Production URL tested:** ${prodUrl}
**Commit tested:** \`${commitSha}\`
**Run started:** ${startedAt}
**Report generated:** ${now.toISOString()}

${section('Comparison to Previous Baseline', diffSection)}
${section(
  'Broken Links / Routes',
  linkReport
    ? `Pages crawled: ${linkReport.pagesCrawled}. Links checked: ${linkReport.linksChecked}. Broken: **${linkReport.brokenInternal.length}**.\n\n` +
        (linkReport.brokenInternal.length
          ? linkReport.brokenInternal.map((b) => `- \`${b.page}\` → \`${b.target}\` (${b.status ?? b.error})`).join('\n')
          : 'None found.')
    : 'Link check did not run this cycle.'
)}
${section(
  'Dependency / Security (npm audit)',
  auditReport
    ? `Total: ${auditReport.metadata?.vulnerabilities?.total ?? 'n/a'} ` +
        `(critical: ${auditReport.metadata?.vulnerabilities?.critical ?? 0}, ` +
        `high: ${auditReport.metadata?.vulnerabilities?.high ?? 0}, ` +
        `moderate: ${auditReport.metadata?.vulnerabilities?.moderate ?? 0}, ` +
        `low: ${auditReport.metadata?.vulnerabilities?.low ?? 0})`
    : 'npm audit did not run this cycle.'
)}
${section('Unit / Integration Tests (jest)', '```\n' + testLog.slice(-4000) + '\n```')}
${section('End-to-End Tests (Playwright)', '```\n' + e2eLog.slice(-4000) + '\n```')}
${section(
  'Accessibility (axe)',
  a11yReport
    ? `Violations found: ${a11yReport.totalViolations ?? 'n/a'}.`
    : 'Accessibility check did not run this cycle (or Worker 7\'s script has not been wired in yet).'
)}
${section(
  'Recommended Human Actions',
  [
    linkReport && linkReport.brokenInternal.length ? '- Review and fix reported broken links.' : null,
    auditReport && (auditReport.metadata?.vulnerabilities?.critical ?? 0) > 0 ? '- **Critical dependency vulnerability found — review immediately.**' : null,
    currentSummary.testsStatus === 'fail' ? '- Test suite is failing — investigate before merging any pending PR.' : null,
    '- Review the linked pull request and merge if the diff is low-risk, or request changes.',
  ]
    .filter(Boolean)
    .join('\n') || 'No action required — all checks passed cleanly.'
)}
`;

  fs.writeFileSync(path.join(outDir, 'report.md'), md);
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(currentSummary, null, 2));
  fs.writeFileSync(baselinePath, JSON.stringify(currentSummary, null, 2));

  console.log(`Report written to reports/site-health/${dateDir}/report.md`);
  console.log(JSON.stringify(currentSummary));
}

main();
