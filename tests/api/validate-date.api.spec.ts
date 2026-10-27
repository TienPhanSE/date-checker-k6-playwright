import { test, expect } from '@playwright/test';

/**
 * Playwright API Test Suite for Date Checker Backend
 * Target Endpoint: GET /api/validate-date?day=...&month=...&year=...
 * Base URL: http://127.0.0.1:3001
 */
test.use({ baseURL: 'http://127.0.0.1:3001' });

test.describe('Date Checker REST API Test Suite @api', () => {
  const endpoint = '/api/validate-date';

  // =========================================================================
  // 1. VALID CALENDAR DATES (HTTP 200 - isValid: true)
  // =========================================================================
  test.describe('1. Valid Calendar Dates (HTTP 200 - isValid: true)', () => {
    test('TC_API_01: Ngày thường hợp lệ (15/08/2025)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15&month=8&year=2025`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
      expect(body.maxDays).toBe(31);
      expect(body.isLeap).toBe(false);
      expect(body.reason).toContain('15/08/2025 là ngày hợp lệ');
    });

    test('TC_API_02: Ngày 29/02 trong năm nhuận chia hết cho 4 (29/02/2024)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=29&month=2&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
      expect(body.maxDays).toBe(29);
      expect(body.isLeap).toBe(true);
      expect(body.reason).toContain('29/02/2024 là ngày hợp lệ');
    });

    test('TC_API_03: Ngày 29/02 trong năm nhuận thế kỷ chia hết cho 400 (29/02/2000)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=29&month=2&year=2000`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
      expect(body.maxDays).toBe(29);
      expect(body.isLeap).toBe(true);
    });

    test('TC_API_04: Ngày 28/02 trong năm thường không nhuận (28/02/2023)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=28&month=2&year=2023`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
      expect(body.maxDays).toBe(28);
      expect(body.isLeap).toBe(false);
    });

    test('TC_API_05: Tháng có 31 ngày - Ngày cuối cùng tháng 1 và tháng 12 (31/01/2024, 31/12/2024)', async ({ request }) => {
      const resJan = await request.get(`${endpoint}?day=31&month=1&year=2024`);
      expect(resJan.status()).toBe(200);
      const bodyJan = await resJan.json();
      expect(bodyJan.isValid).toBe(true);
      expect(bodyJan.maxDays).toBe(31);

      const resDec = await request.get(`${endpoint}?day=31&month=12&year=2024`);
      expect(resDec.status()).toBe(200);
      const bodyDec = await resDec.json();
      expect(bodyDec.isValid).toBe(true);
      expect(bodyDec.maxDays).toBe(31);
    });

    test('TC_API_06: Tháng có 30 ngày - Ngày 30 tháng 4 (30/04/2024)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=30&month=4&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
      expect(body.maxDays).toBe(30);
    });

    test('TC_API_07: Biên nhỏ nhất của hệ thống (01/01/0001)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=1&month=1&year=1`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
    });

    test('TC_API_08: Biên lớn nhất của hệ thống (31/12/9999)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=31&month=12&year=9999`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(true);
    });
  });

  // =========================================================================
  // 2. INVALID CALENDAR DATES (HTTP 200 - isValid: false)
  // =========================================================================
  test.describe('2. Invalid Calendar Dates (HTTP 200 - isValid: false)', () => {
    test('TC_API_09: Ngày 29/02 trong năm không nhuận (29/02/2023)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=29&month=2&year=2023`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
      expect(body.reason).toContain('tháng 2 chỉ có 28 ngày');
    });

    test('TC_API_10: Ngày 29/02 trong năm tròn thế kỷ không nhuận (29/02/1900)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=29&month=2&year=1900`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
      expect(body.reason).toContain('không phải năm nhuận');
    });

    test('TC_API_11: Ngày 31 trong tháng chỉ có 30 ngày (31/04/2024)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=31&month=4&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
      expect(body.reason).toContain('chỉ có tối đa 30 ngày');
    });

    test('TC_API_12: Ngày 31 tháng 2 không bao giờ tồn tại (31/02/2024)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=31&month=2&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
    });
  });

  // =========================================================================
  // 3. INPUT FORMAT VALIDATION & MISSING PARAMS (HTTP 200 - isValid: false)
  // =========================================================================
  test.describe('3. Input Format & Missing Parameters Validation', () => {
    test('TC_API_13: Thiếu tham số Day', async ({ request }) => {
      const response = await request.get(`${endpoint}?month=8&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
      expect(body.reason).toContain('Ngày phải là một số nguyên dương');
    });

    test('TC_API_14: Thiếu tham số Month', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('month');
      expect(body.reason).toContain('Tháng phải là một số nguyên dương');
    });

    test('TC_API_15: Thiếu tham số Year', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15&month=8`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('year');
      expect(body.reason).toContain('Năm phải là một số nguyên dương');
    });

    test('TC_API_16: Ngày chứa ký tự chữ (day=abc)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=abc&month=8&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
    });

    test('TC_API_17: Ngày là số thập phân (day=15.5)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15.5&month=8&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
    });

    test('TC_API_18: Tham số là số âm (day=-5)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=-5&month=8&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
    });
  });

  // =========================================================================
  // 4. RANGE & BOUNDARY VALIDATION
  // =========================================================================
  test.describe('4. Input Range Validation', () => {
    test('TC_API_19: Ngày bằng 0 (day=0)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=0&month=5&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
    });

    test('TC_API_20: Ngày vượt quá 31 (day=32)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=32&month=5&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('day');
    });

    test('TC_API_21: Tháng bằng 0 (month=0)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15&month=0&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('month');
      expect(body.reason).toContain('Tháng 0 không hợp lệ');
    });

    test('TC_API_22: Tháng vượt quá 12 (month=13)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15&month=13&year=2024`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('month');
      expect(body.reason).toContain('Tháng 13 không hợp lệ');
    });

    test('TC_API_23: Năm vượt quá 9999 (year=10000)', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=15&month=8&year=10000`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.isValid).toBe(false);
      expect(body.field).toBe('year');
      expect(body.reason).toContain('Năm phải nằm trong khoảng từ 1 đến 9999');
    });
  });

  // =========================================================================
  // 5. HTTP PROTOCOL & SECURITY STANDARDS
  // =========================================================================
  test.describe('5. HTTP Protocol & Method Checks', () => {
    test('TC_API_24: Content-Type header trả về là application/json UTF-8', async ({ request }) => {
      const response = await request.get(`${endpoint}?day=1&month=1&year=2024`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('TC_API_25: Gửi method POST trả về HTTP 405 Method Not Allowed', async ({ request }) => {
      const response = await request.post(endpoint, {
        data: { day: 15, month: 8, year: 2024 }
      });
      expect(response.status()).toBe(405);
      expect(response.headers()['allow']).toBe('GET');
    });

    test('TC_API_26: Gửi method PUT/DELETE trả về HTTP 405 Method Not Allowed', async ({ request }) => {
      const resPut = await request.put(endpoint);
      expect(resPut.status()).toBe(405);

      const resDelete = await request.delete(endpoint);
      expect(resDelete.status()).toBe(405);
    });

    test('TC_API_27: Đường dẫn không tồn tại trả về HTTP 404 Not Found', async ({ request }) => {
      const response = await request.get('/api/unknown-endpoint');
      expect(response.status()).toBe(404);
      const text = await response.text();
      expect(text).toBe('Not found');
    });
  });
});
