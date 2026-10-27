import { test, expect } from '@playwright/test';
import { DayInMonth, dayInMonth } from '../../src/date-validator.js';

test.describe('SWT301 Unit Tests - Function "DayInMonth" (Function2 / Function B)', () => {
  // =========================================================================
  // 1. CÁC TEST CASE CHÍNH XÁC TỪ FILE TEMPLATE (UTCID01 - UTCID05)
  // =========================================================================
  test.describe('Test cases từ file Template_Unit Test Case.xls', () => {
    test('UTCID01 (Normal): Tháng 1 năm 2020 có 31 ngày', () => {
      // Month: 1, Year: 2020 -> Return: 31
      const result = DayInMonth(1, 2020);
      expect(result).toBe(31);
    });

    test('UTCID02 (Normal): Tháng 4 năm 2020 có 30 ngày', () => {
      // Month: 4, Year: 2020 -> Return: 30
      const result = DayInMonth(4, 2020);
      expect(result).toBe(30);
    });

    test('UTCID03 (Boundary): Tháng 2 năm nhuận thế kỷ 2000 (chia hết cho 400) có 29 ngày', () => {
      // Month: 2, Year: 2000 -> Return: 29
      const result = DayInMonth(2, 2000);
      expect(result).toBe(29);
    });

    test('UTCID04 (Boundary): Tháng 2 năm tròn thế kỷ 1900 (không chia hết 400) có 28 ngày', () => {
      // Month: 2, Year: 1900 -> Return: 28
      const result = DayInMonth(2, 1900);
      expect(result).toBe(28);
    });

    test('UTCID05 (Abnormal): Tháng 13 năm 2020 không hợp lệ trả về 0', () => {
      // Month: 13, Year: 2020 -> Return: 0
      const result = DayInMonth(13, 2020);
      expect(result).toBe(0);
    });
  });

  // =========================================================================
  // 2. CÁC TEST CASE MỞ RỘNG ĐẢM BẢO ĐỦ 15 TEST CASES (BVA & EQUIVALENCE PARTITIONING)
  // =========================================================================
  test.describe('Bổ sung đầy đủ 15 Test Cases theo ma trận BVA / EP', () => {
    test('UTCID06 (Normal): Tháng 2 năm thường 2019 có 28 ngày', () => {
      expect(DayInMonth(2, 2019)).toBe(28);
    });

    test('UTCID07 (Normal): Tháng 2 năm nhuận thông thường 2024 (chia hết 4) có 29 ngày', () => {
      expect(DayInMonth(2, 2024)).toBe(29);
    });

    test('UTCID08 (Boundary): Biên tháng nhỏ nhất hợp lệ - Tháng 1 năm 2024 có 31 ngày', () => {
      expect(DayInMonth(1, 2024)).toBe(31);
    });

    test('UTCID09 (Boundary): Biên tháng lớn nhất hợp lệ - Tháng 12 năm 2024 có 31 ngày', () => {
      expect(DayInMonth(12, 2024)).toBe(31);
    });

    test('UTCID10 (Normal): Tháng 6 năm 2024 có 30 ngày', () => {
      expect(DayInMonth(6, 2024)).toBe(30);
    });

    test('UTCID11 (Normal): Tháng 7 năm 2024 có 31 ngày', () => {
      expect(DayInMonth(7, 2024)).toBe(31);
    });

    test('UTCID12 (Normal): Tháng 8 năm 2024 (hai tháng 31 ngày liên tiếp) có 31 ngày', () => {
      expect(DayInMonth(8, 2024)).toBe(31);
    });

    test('UTCID13 (Abnormal): Tháng 0 (dưới biên dưới) trả về 0', () => {
      expect(DayInMonth(0, 2020)).toBe(0);
    });

    test('UTCID14 (Abnormal): Tháng âm (-1) trả về 0', () => {
      expect(DayInMonth(-1, 2020)).toBe(0);
    });

    test('UTCID15 (Abnormal): Dữ liệu tháng không phải số nguyên (chuỗi hoặc thập phân) trả về 0', () => {
      expect(DayInMonth('abc' as any, 2020)).toBe(0);
      expect(DayInMonth(2.5, 2020)).toBe(0);
    });
  });
});
