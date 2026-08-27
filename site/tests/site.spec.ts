import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page is accessible and demo catches loss', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Collection Escape Hatch/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  await page.getByRole('button', { name: 'Load lossy sample' }).click();
  await expect(page.getByText('Changes detected', { exact: true })).toBeVisible();
  await expect(page.getByText(/METHOD_CHANGED/)).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('empty and input error states explain the next action', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('No measurement yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Run inspection' }).click();
  await expect(page.getByText('Inspection stopped.')).toBeVisible();
  await expect(page.getByText(/Choose both/)).toBeVisible();
});

test('keyboard path reaches primary controls', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: 'Load lossy sample' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Changes detected', { exact: true })).toBeVisible();
});

test('legal pages have semantic shells', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
  }
});
