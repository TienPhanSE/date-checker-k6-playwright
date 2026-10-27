import test from 'node:test';
import assert from 'node:assert/strict';
import { isLeapYear, validateDate } from '../../src/date-validator.js';

test('2024 là năm nhuận', () => {
  assert.equal(isLeapYear(2024), true);
});

test('1900 không phải năm nhuận', () => {
  assert.equal(isLeapYear(1900), false);
});

test('29/02/2024 hợp lệ', () => {
  assert.equal(validateDate('29', '2', '2024').isValid, true);
});

test('29/02/2023 không hợp lệ', () => {
  assert.equal(validateDate('29', '2', '2023').isValid, false);
});

test('31/04/2025 không hợp lệ', () => {
  assert.equal(validateDate('31', '4', '2025').isValid, false);
});