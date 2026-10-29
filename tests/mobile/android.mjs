import assert from 'node:assert/strict';
import { remote } from 'webdriverio';

/**
 * Mobile Web Automation Test trên Android Emulator (Chrome Browser)
 * Yêu cầu:
 * 1. Khởi động máy ảo Android trong Android Studio (Device Manager)
 * 2. Khởi động Web App: npm run dev -- --host 0.0.0.0 --port 5173
 * 3. Khởi động Appium: npx appium
 * 4. Chạy file này: node tests/mobile/android.mjs
 */

const udid = process.env.ANDROID_UDID || 'emulator-5554';
const webUrl = process.env.MOBILE_BASE_URL || 'http://10.0.2.2:5173';

console.log(`[INFO] Kết nối với thiết bị: ${udid}`);
console.log(`[INFO] Truy cập Web App: ${webUrl}`);

const driver = await remote({
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    browserName: 'Chrome',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:udid': udid,
    'appium:newCommandTimeout': 240,
  },
});

try {
  console.log('\n======================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ WEB APP DATE CHECKER TRÊN ANDROID');
  console.log('======================================================\n');

  // 1. Mở trang Web App qua loopback 10.0.2.2
  await driver.url(webUrl);
  await driver.$('#day').waitForDisplayed({ timeout: 15000 });
  console.log('✅ 1. Tải trang thành công trên trình duyệt Chrome Mobile.');

  // 2. Test Case 1: Kiểm tra ngày hợp lệ trong năm nhuận (29/02/2024)
  console.log('\n--- Test Case 1: Kiểm tra 29/02/2024 (Năm nhuận) ---');
  await driver.$('#day').setValue('29');
  await driver.$('#month').setValue('2');
  await driver.$('#year').setValue('2024');
  await driver.$('#btn-check').click();

  await driver.waitUntil(
    async () => (await driver.$('#result-status-badge').getText()) === 'HỢP LỆ',
    { timeout: 5000, timeoutMsg: 'Kết quả 29/02/2024 phải là HỢP LỆ' }
  );
  console.log('✅ PASS TC1: Ngày 29/02/2024 hiển thị kết quả HỢP LỆ');

  // 3. Test Case 2: Kiểm tra ngày không hợp lệ năm thường (29/02/2023)
  console.log('\n--- Test Case 2: Kiểm tra 29/02/2023 (Năm không nhuận) ---');
  await driver.$('#day').setValue('29');
  await driver.$('#month').setValue('2');
  await driver.$('#year').setValue('2023');
  await driver.$('#btn-check').click();

  await driver.waitUntil(
    async () => (await driver.$('#result-status-badge').getText()) === 'KHÔNG HỢP LỆ',
    { timeout: 5000, timeoutMsg: 'Kết quả 29/02/2023 phải là KHÔNG HỢP LỆ' }
  );
  console.log('✅ PASS TC2: Ngày 29/02/2023 hiển thị kết quả KHÔNG HỢP LỆ');

  // 4. Test Case 3: Kiểm tra ngày 31 tháng 4 (tháng 4 có tối đa 30 ngày)
  console.log('\n--- Test Case 3: Kiểm tra 31/04/2024 (Tháng 4 chỉ có 30 ngày) ---');
  await driver.$('#day').setValue('31');
  await driver.$('#month').setValue('4');
  await driver.$('#year').setValue('2024');
  await driver.$('#btn-check').click();

  await driver.waitUntil(
    async () => (await driver.$('#result-status-badge').getText()) === 'KHÔNG HỢP LỆ',
    { timeout: 5000, timeoutMsg: 'Kết quả 31/04/2024 phải là KHÔNG HỢP LỆ' }
  );
  console.log('✅ PASS TC3: Ngày 31/04/2024 hiển thị kết quả KHÔNG HỢP LỆ');

  // 5. Test Case 4: Thao tác chọn nhanh mẫu thử (Preset Chip)
  console.log('\n--- Test Case 4: Thao tác nút chọn nhanh (Preset Leap Year) ---');
  const presetLeap = await driver.$('#preset-leap');
  await presetLeap.click();

  const dVal = await driver.$('#day').getValue();
  const mVal = await driver.$('#month').getValue();
  const yVal = await driver.$('#year').getValue();
  assert.equal(dVal, '29');
  assert.equal(mVal, '2');
  assert.equal(yVal, '2024');
  console.log('✅ PASS TC4: Nút chọn mẫu tự động điền đúng 29/02/2024');

  // 6. Test Case 5: Thao tác nút Đặt lại (Reset)
  console.log('\n--- Test Case 5: Thao tác nút Đặt lại (Reset Form) ---');
  const btnReset = await driver.$('#btn-reset');
  await btnReset.click();

  assert.equal(await driver.$('#day').getValue(), '');
  assert.equal(await driver.$('#month').getValue(), '');
  assert.equal(await driver.$('#year').getValue(), '');
  assert.equal(await driver.$('#result-box').isDisplayed(), false);
  console.log('✅ PASS TC5: Nút Đặt lại làm sạch toàn bộ ô nhập và ẩn kết quả.');

  console.log('\n======================================================');
  console.log('🎉 TOÀN BỘ KIỂM THỬ TRÊN ANDROID EMULATOR ĐÃ HOÀN TẤT THÀNH CÔNG!');
  console.log('======================================================\n');
} catch (error) {
  console.error('\n❌ KIỂM THỬ THẤT BẠI:', error.message);
  process.exit(1);
} finally {
  await driver.deleteSession();
}
