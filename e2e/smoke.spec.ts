import { test, expect } from '@playwright/test';

test('homepage shows today menu and weighing data', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/^Day \d/)).toBeVisible();
  // The visible day panel should contain weighing data
  const visibleDay = page.locator('[data-day]:not(.hidden)');
  await expect(visibleDay.locator('text=糙米').first()).toBeVisible();
  await expect(
    visibleDay.locator('text=虾仁').or(visibleDay.locator('text=牛腿肉')).first()
  ).toBeVisible();
});

test('homepage date navigation works', async ({ page }) => {
  await page.goto('/?day=1');
  await expect(page.getByText('Day 1', { exact: false })).toBeVisible();
  const day1Panel = page.locator('[data-day="1"]');
  await expect(day1Panel).toBeVisible();
  await expect(day1Panel.getByRole('heading', { name: /番茄虾仁/ })).toBeVisible();
});

test('shopping page shows checklist', async ({ page }) => {
  await page.goto('/shopping');
  await expect(page.locator('text=一周采购清单')).toBeVisible();
  await expect(page.locator('text=青菜包子')).toBeVisible();
});

test('shopping checklist toggle persists', async ({ page }) => {
  await page.goto('/shopping');
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();
  await page.reload();
  await expect(firstCheckbox).toBeChecked();
});
