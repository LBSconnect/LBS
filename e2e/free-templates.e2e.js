const { test, expect } = require('@playwright/test');
const { trackPage } = require('./helpers');

// The webServer in playwright.config.js points LEAD_FORM_ENDPOINT at a
// closed local port, so submitting this form never sends a real lead.

test.describe('Free BA Templates page', () => {
  test('validates the form, then unlocks working downloads after submit', async ({ page }) => {
    const tracking = trackPage(page);
    const response = await page.goto('/free-ba-templates.html', { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(/Free BA Templates/i);

    // No paid checkout links survive on the page.
    expect(await page.locator('a[href*="checkout.lbs4.com"]').count()).toBe(0);

    // Consent is required.
    await page.fill('#lead-name', 'E2E Tester');
    await page.fill('#lead-email', 'e2e@example.gov');
    await page.click('#lead-submit');
    await expect(page.locator('#lead-error')).toBeVisible();
    await expect(page.locator('#lead-success')).toBeHidden();

    await page.check('#lead-consent');
    await page.click('#lead-submit');
    await expect(page.locator('#lead-success')).toBeVisible();

    const zipHref = await page.locator('#lead-zip').getAttribute('href');
    expect(zipHref).toMatch(/^\/api\/download\?token=[a-f0-9]{64}$/);

    const brdHref = await page.locator('.template-card__cta[data-template="brd"]').getAttribute('href');
    expect(brdHref).toContain('&file=brd');

    const dl = await page.request.get(brdHref);
    expect(dl.status()).toBe(200);
    expect(dl.headers()['content-disposition']).toContain('ba-template-brd.docx');

    tracking.assertClean();
  });
});

test.describe('Retired pages', () => {
  for (const [from, to] of [
    ['/shop.html', /free-ba-templates\.html$/],
    ['/academy.html', /services\.html$/],
    ['/software.html', /portfolio\.html$/],
  ]) {
    test(`${from} redirects`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(to);
    });
  }
});
