import { test, expect } from '@playwright/test';

test.describe('CI/CD Pipeline Verification', () => {
  test('Giao diện hiển thị đúng và chức năng kiểm tra ngày hoạt động', async ({ page }) => {
    await page.goto('/');

    // Kiểm tra title
    await expect(page).toHaveTitle(/Date Validator/i);

    // Kiểm tra form nhập liệu
    await expect(page.locator('#day')).toBeVisible();
    await expect(page.locator('#month')).toBeVisible();
    await expect(page.locator('#year')).toBeVisible();

    // Nhập ngày hợp lệ thử nghiệm: 29/02/2024 (năm nhuận)
    await page.locator('#day').fill('29');
    await page.locator('#month').fill('2');
    await page.locator('#year').fill('2024');
    await page.locator('#btn-check').click();

    // Xác nhận kết quả
    const resultBox = page.locator('#result-box');
    await expect(resultBox).toBeVisible();
    await expect(page.locator('#result-status-badge')).toHaveText('HỢP LỆ');
    await expect(page.locator('#result-message')).toContainText('29/02/2024 là ngày hợp lệ (năm nhuận)');
  });
});
