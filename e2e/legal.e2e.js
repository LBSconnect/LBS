const { test, expect } = require('@playwright/test');
const { trackPage, LEGAL_SPOT_CHECK_LINKS } = require('./helpers');

test.describe('Legal hub page', () => {
  test('legal.html loads with its heading and full link index', async ({ page }) => {
    const tracking = trackPage(page);
    const response = await page.goto('/legal.html', { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(/Legal/i);

    const linkCount = await page.locator('.legal-index__link').count();
    // ~20 policy links across LBS / LBSconnect / MyEasyPass / Workabeez / LBS4.
    expect(linkCount).toBeGreaterThanOrEqual(18);

    tracking.assertClean();
  });

  for (const href of LEGAL_SPOT_CHECK_LINKS) {
    test(`legal link "${href}" resolves to a 200 page`, async ({ page }) => {
      const tracking = trackPage(page);
      await page.goto('/legal.html', { waitUntil: 'load' });

      const link = page.locator(`.legal-index__link[href="${href}"]`);
      await expect(link).toBeVisible();

      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().endsWith(`/${href}`) && res.request().isNavigationRequest()
        ),
        link.click(),
      ]);

      expect(response.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${href.replace('.', '\\.')}$`));
      await expect(page.locator('h1').first()).toBeVisible();

      tracking.assertClean();
    });
  }
});
