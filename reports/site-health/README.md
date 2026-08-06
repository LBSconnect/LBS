# Site Health Reports

This directory holds the output of the weekly automated site-health audit
(`.github/workflows/weekly-site-health.yml`), which runs every Friday at
12:00 AM `America/Chicago`.

Each run creates a dated subdirectory:

```
reports/site-health/YYYY-MM-DD/
  report.md      — human-readable summary (see the PR opened by that run)
  summary.json   — machine-readable summary used for week-over-week diffing
```

`baseline.json` at this level always holds the most recent run's summary,
used to compute the "Comparison to Previous Baseline" section of the next
report.

No secrets, credentials, or personal/customer data are ever written here —
only aggregate counts (broken links, vulnerability counts, test pass/fail),
public URLs, and file paths already present in the repository.
