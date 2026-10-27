import { test, expect } from '@playwright/test';
import { CheckDate, checkDate, validateDate } from '../../src/date-validator.js';

test.describe('SWT301 Unit Tests - Function "CheckDate" (Function1 / Function A)', () => {
  // =========================================================================
  // 1. CÁC TEST CASE TỪ FILE TEMPLATE (UTCID01 - UTCID05)
  // =========================================================================
  test.describe('Test cases từ file Template_Unit Test Case.xls', () => {
    test('UTCID01 (Normal): Ngày 29/01/2020 là ngày hợp lệ (Return: True)', () => {
      // Day: 29, Month: 1, Year: 2020 -> Return: T
      const result = CheckDate(29, 1, 2020);
      expect(result).toBe(true);

      const validation = validateDate('29', '1', '2020');
      expect(validation.isValid).toBe(true);
    });

    test('UTCID02 (Boundary): Tháng 4 có tối đa 30 ngày - Ngày 31/04/2020 là không hợp lệ (Return: False)', () => {
      // Tháng 4 chỉ có 30 ngày
      expect(CheckDate(30, 4, 2020)).toBe(true);
      expect(CheckDate(31, 4, 2020)).toBe(false);

      const validation = validateDate('31', '4', '2020');
      expect(validation.isValid).toBe(false);
    });

    test('UTCID02_Note: Kiểm tra ngày 29/04/2020 thực tế là hợp lệ (làm rõ sai lệch kỳ vọng DFID001 trong template)', () => {
      // Trong file Excel template hàng 17/23 có đánh dấu 29/04/2020 nhưng kỳ vọng nhầm F dẫn tới Defect DFID001
      expect(CheckDate(29, 4, 2020)).toBe(true);
    });

    test('UTCID03 (Boundary): Ngày 31/02/2000 là không hợp lệ (Return: False)', () => {
      // Day: 31, Month: 2, Year: 2000 -> Return: F
      const result = CheckDate(31, 2, 2000);
      expect(result).toBe(false);

      const validation = validateDate('31', '2', '2000');
      expect(validation.isValid).toBe(false);
    });

    test('UTCID04 (Boundary): Ngày 29/02/1900 năm tròn thế kỷ không nhuận là không hợp lệ (Return: False)', () => {
      // Day: 29, Month: 2, Year: 1900 -> Return: F
      const result = CheckDate(29, 2, 1900);
      expect(result).toBe(false);

      const validation = validateDate('29', '2', '1900');
      expect(validation.isValid).toBe(false);
    });

    test('UTCID05 (Abnormal): Ngày 29/13/2020 có tháng 13 không hợp lệ (Return: False)', () => {
      // Day: 29, Month: 13, Year: 2020 -> Return: F
      const result = CheckDate(29, 13, 2020);
      expect(result).toBe(false);

      const validation = validateDate('29', '13', '2020');
      expect(validation.isValid).toBe(false);
    });
  });

  // =========================================================================
  // 2. CÁC TEST CASE MỞ RỘNG ĐẢM BẢO ĐỦ 15 TEST CASES (BVA & EQUIVALENCE PARTITIONING)
  // =========================================================================
  test.describe('Bổ sung đầy đủ 15 Test Cases theo ma trận BVA / EP', () => {
    test('UTCID06 (Normal): 29/02/2000 năm nhuận thế kỷ chia hết 400 là hợp lệ', () => {
      expect(CheckDate(29, 2, 2000)).toBe(true);
    });

    test('UTCID07 (Normal): 29/02/2024 năm nhuận thông thường chia hết 4 là hợp lệ', () => {
      expect(CheckDate(29, 2, 2024)).toBe(true);
    });

    test('UTCID08 (Boundary): 29/02/2023 năm thường không nhuận là không hợp lệ', () => {
      expect(CheckDate(29, 2, 2023)).toBe(false);
    });

    test('UTCID09 (Boundary): 28/02/2023 ngày cuối cùng tháng 2 năm thường là hợp lệ', () => {
      expect(CheckDate(28, 2, 2023)).toBe(true);
    });

    test('UTCID10 (Boundary): 01/01/1000 biên nhỏ nhất trong phạm vi chuẩn URD là hợp lệ', () => {
      expect(CheckDate(1, 1, 1000)).toBe(true);
    });

    test('UTCID11 (Boundary): 31/12/3000 biên lớn nhất trong phạm vi chuẩn URD là hợp lệ', () => {
      expect(CheckDate(31, 12, 3000)).toBe(true);
    });

    test('UTCID12 (Boundary): Ngày 0 trong tháng (00/01/2020) không hợp lệ', () => {
      expect(CheckDate(0, 1, 2020)).toBe(false);
    });

    test('UTCID13 (Boundary): Ngày 32 trong tháng 31 ngày (32/01/2020) không hợp lệ', () => {
      expect(CheckDate(32, 1, 2020)).toBe(false);
    });

    test('UTCID14 (Abnormal): Ngày âm (-5/05/2020) không hợp lệ', () => {
      expect(CheckDate(-5, 5, 2020)).toBe(false);
    });

    test('UTCID15 (Abnormal): Dữ liệu nhập dạng chuỗi không phải số nguyên trả về false', () => {
      expect(CheckDate('abc' as any, 1, 2020)).toBe(false);
      expect(CheckDate(15.5, 1, 2020)).toBe(false);
    });
  });
});
