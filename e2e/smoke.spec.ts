import { test, expect } from '@playwright/test';

test('homepage shows today menu and weighing data', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/^Day \d/)).toBeVisible();
  // Weighing data should be visible (check weighing card heading)
  await expect(page.getByRole('heading', { name: /👨/ }).first()).toBeVisible();
});

test('homepage date navigation works', async ({ page }) => {
  await page.goto('/?day=1');
  await expect(page.getByText('Day 1', { exact: false })).toBeVisible();
});

test('homepage language toggle switches to English', async ({ page }) => {
  await page.goto('/');
  // Click the language toggle button (fixed top-right)
  const toggle = page.locator('button[aria-label="Switch to English"]');
  await toggle.click();
  // Should show English content (BottomNav shows "Today" instead of "今日")
  await expect(page.getByRole('link', { name: /🏠 Today/ })).toBeVisible();
  // Verify weighing data is still visible
  await expect(page.getByRole('heading', { name: /👨/ }).first()).toBeVisible();
});

test('shopping page shows checklist', async ({ page }) => {
  await page.goto('/shopping');
  await expect(page.getByRole('heading', { name: /🛒/ })).toBeVisible();
  // Check that items are visible
  await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
});

test('shopping page language toggle switches to English', async ({ page }) => {
  await page.goto('/shopping');
  const toggle = page.locator('button[aria-label="Switch to English"]');
  await toggle.click();
  await expect(page.getByText('Weekly Shopping List')).toBeVisible();
});

test('shopping checklist toggle persists', async ({ page }) => {
  await page.goto('/shopping');
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();
  await page.reload();
  await expect(firstCheckbox).toBeChecked();
});
