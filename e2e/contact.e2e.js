const { test, expect } = require('@playwright/test');
const { trackPage } = require('./helpers');

test.describe('Contact page', () => {
  test('form fields are present', async ({ page }) => {
    const tracking = trackPage(page);
    await page.goto('/contact.html', { waitUntil: 'load' });

    await expect(page.locator('#first-name')).toBeVisible();
    await expect(page.locator('#last-name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#organization')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#package')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('.contact-form .form-submit')).toBeVisible();

    tracking.assertClean();
  });

  test('required-field browser validation blocks an empty submission', async ({ page }) => {
    const tracking = trackPage(page);
    await page.goto('/contact.html', { waitUntil: 'load' });

    // Safety net: never let a real request reach Formspree from this test,
    // even if validation somehow failed to block the submit.
    let formspreeHit = false;
    await page.route('https://formspree.io/**', (route) => {
      formspreeHit = true;
      route.abort();
    });

    const form = page.locator('#contact-form');
    const submit = page.locator('.contact-form .form-submit');

    // Form is empty; required fields are first-name, last-name, email, message.
    await submit.click();

    // Native constraint validation should block the submit — we're still on
    // the same page and the first required field reports as invalid.
    await expect(page).toHaveURL(/contact\.html$/);
    const firstNameValid = await page.locator('#first-name').evaluate((el) => el.validity.valid);
    expect(firstNameValid).toBe(false);
    const formValid = await form.evaluate((el) => el.checkValidity());
    expect(formValid).toBe(false);
    expect(formspreeHit).toBe(false);

    tracking.assertClean();
  });

  test('filling only some required fields still blocks submission until all are valid', async ({ page }) => {
    const tracking = trackPage(page);
    await page.goto('/contact.html', { waitUntil: 'load' });

    let formspreeHit = false;
    await page.route('https://formspree.io/**', (route) => {
      formspreeHit = true;
      route.abort();
    });

    await page.locator('#first-name').fill('Jane');
    await page.locator('#last-name').fill('Smith');
    // Intentionally leave email + message empty.

    await page.locator('.contact-form .form-submit').click();

    await expect(page).toHaveURL(/contact\.html$/);
    const emailValid = await page.locator('#email').evaluate((el) => el.validity.valid);
    expect(emailValid).toBe(false);
    expect(formspreeHit).toBe(false);

    tracking.assertClean();
  });
});
