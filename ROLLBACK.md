# Rollback Procedure

This repository deploys to **Render** (see `render.yaml`), which auto-deploys
from the `main` branch. This automation has no Render API credentials and
cannot trigger a rollback programmatically — rollback is a manual step in
the Render dashboard, documented here so it's never something you have to
figure out under pressure.

## If production is broken after a merge to `main`

1. **Identify the last known-good commit.** Check recent merges to `main`
   on GitHub (https://github.com/LBSconnect/LBS/commits/main), or the most
   recent `reports/site-health/YYYY-MM-DD/report.md` that showed a passing
   production smoke check.
2. **Roll back in Render:**
   - Open the Render dashboard → the `lbsconnect` web service.
   - Go to the **Deploys** tab.
   - Find the last deploy that was healthy (matches the good commit SHA).
   - Click **Rollback to this deploy** (Render redeploys that exact commit).
3. **Confirm recovery:** once Render reports the rollback deploy as live,
   re-run the read-only smoke check yourself:
   ```
   curl -s -o /dev/null -w "%{http_code}\n" https://www.lbsconnect.net/
   curl -s -o /dev/null -w "%{http_code}\n" https://www.lbsconnect.net/health
   ```
   Both should return `200`.
4. **Fix forward in a branch**, not directly on `main`. Reproduce the issue
   locally (`npm ci && npm test && node server.js`), fix it, let the normal
   PR + review process run, and only merge to `main` once `npm test` and
   the weekly workflow's checks (or a manual `workflow_dispatch` run of
   `.github/workflows/weekly-site-health.yml`) pass again.

## If a weekly automated PR was bad

Because the weekly workflow only ever auto-merges changes to
`package-lock.json` and `reports/site-health/**` (see the `risk` gate in
`.github/workflows/weekly-site-health.yml`), the blast radius of an
automated merge is inherently small — worst case, revert that single merge
commit on GitHub ("Revert" button on the PR) and `npm ci` will pick up the
previous lockfile again. No page content, pricing, legal text, auth, or
payment logic is ever touched by an auto-merge.

## Git-level safety checkpoint

The commit `main` was at immediately before this audit began:

```
8a4fc43  Merge pull request #45 from LBSconnect/claude/add-workabeez-product-46epf4
```

Restorable at any time with:
```
git checkout 8a4fc43 -- .
```
or by resetting a branch to it directly if a full revert is ever needed.
