const { test, expect } = require('@playwright/test');
const { trackPage } = require('./helpers');

test.describe('Homepage', () => {
  test('loads with the correct title, no console errors, no failed own-asset requests', async ({ page }) => {
    const tracking = trackPage(page);

    const response = await page.goto('/index.html', { waitUntil: 'load' });
    expect(response.status()).toBe(200);

    await expect(page).toHaveTitle(
      /Business Analysis & Government IT Modernization Consulting \| Linton Business Solutions \(LBS\)/
    );
    await expect(page.locator('h1').first()).toContainText(/Modernize Your/i);

    tracking.assertClean();
  });

  test('root path ("/") also serves the homepage', async ({ page }) => {
    const tracking = trackPage(page);
    const response = await page.goto('/', { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/Linton Business Solutions/);
    tracking.assertClean();
  });
});
