import { test, expect } from '@playwright/test';

test.describe('Mobile Web Browser Testing - Android Pixel 7 Viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC_MOB_01: Giao diện hiển thị đúng chuẩn Responsive trên màn hình Mobile', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#day')).toBeVisible();
    await expect(page.locator('#month')).toBeVisible();
    await expect(page.locator('#year')).toBeVisible();
    await expect(page.locator('#btn-check')).toBeVisible();
    await expect(page.locator('#preset-leap')).toBeVisible();
    await expect(page.locator('#preset-non-leap')).toBeVisible();
  });

  test('TC_MOB_02: Thao tác nhập liệu và kiểm tra ngày hợp lệ (29/02/2024)', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2024');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(page.locator('#result-status-badge')).toHaveText('HỢP LỆ');
    await expect(page.locator('#result-message')).toContainText('29/02/2024 là ngày hợp lệ');
  });

  test('TC_MOB_03: Chạm nút chọn nhanh (Preset Leap Year) trên Mobile', async ({ page }) => {
    await page.locator('#preset-leap').click();

    await expect(page.locator('#day')).toHaveValue('29');
    await expect(page.locator('#month')).toHaveValue('2');
    await expect(page.locator('#year')).toHaveValue('2024');

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(page.locator('#result-status-badge')).toHaveText('HỢP LỆ');
  });

  test('TC_MOB_04: Kiểm tra ngày không hợp lệ (29/02/2023) trên Mobile', async ({ page }) => {
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2023');
    await page.locator('#btn-check').click();

    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toHaveClass(/invalid/);
    await expect(page.locator('#result-status-badge')).toHaveText('KHÔNG HỢP LỆ');
  });

  test('TC_MOB_05: Thao tác chạm nút Đặt lại (Reset) trên Mobile', async ({ page }) => {
    await page.locator('#preset-leap').click();
    await expect(page.locator('#result-box')).toBeVisible();

    await page.locator('#btn-reset').click();

    await expect(page.locator('#day')).toHaveValue('');
    await expect(page.locator('#month')).toHaveValue('');
    await expect(page.locator('#year')).toHaveValue('');
    await expect(page.locator('#result-box')).toBeHidden();
  });
});
