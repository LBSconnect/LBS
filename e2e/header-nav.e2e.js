const { test, expect } = require('@playwright/test');
const { trackPage, NAV_LINKS } = require('./helpers');

// Runs once per Playwright project (desktop-chromium + mobile-chromium, per
// playwright.config.js), so every link is exercised at both breakpoints.
// On the mobile project the links only become visible/clickable after the
// hamburger is opened, so the click path branches on viewport width rather
// than duplicating the whole spec into separate describe blocks.

test.describe('Header navigation', () => {
  for (const link of NAV_LINKS) {
    test(`"${link.text}" nav link goes to a 200 page with the expected heading`, async ({ page }) => {
      const tracking = trackPage(page);
      await page.goto('/index.html', { waitUntil: 'load' });

      const viewport = page.viewportSize();
      const isMobileLayout = viewport && viewport.width <= 768;

      let clickLocator;
      if (isMobileLayout) {
        const toggle = page.getByRole('button', { name: /toggle mobile menu/i });
        await toggle.click();
        await expect(page.locator('#nav-mobile')).toHaveClass(/open/);
        clickLocator = page.locator('.nav__mobile-link', { hasText: link.text });
      } else {
        clickLocator = page.locator('.nav__links .nav__link', { hasText: link.text });
      }

      const [response] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().endsWith(`/${link.href}`) && res.request().isNavigationRequest()
        ),
        clickLocator.click(),
      ]);

      expect(response.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${link.href.replace('.', '\\.')}$`));
      await expect(page.locator('h1').first()).toContainText(link.h1);

      tracking.assertClean();
    });
  }
});
