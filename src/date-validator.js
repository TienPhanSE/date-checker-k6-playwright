export function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

export function getMaxDaysInMonth(month, year) {
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
    return 31;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return 0;
}

/**
 * DayInMonth / DaysInMonth - Hàm kiểm tra số ngày trong tháng chuẩn SWT301 Lab 2 & Lab 3
 * @param {number|string} month Tháng (1-12)
 * @param {number|string} year Năm
 * @returns {number} Số ngày trong tháng (28, 29, 30, 31 hoặc 0 nếu tháng không hợp lệ)
 */
export function dayInMonth(month, year) {
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(m) || !Number.isInteger(y)) return 0;
  return getMaxDaysInMonth(m, y);
}
export const DayInMonth = dayInMonth;

/**
 * CheckDate - Hàm kiểm tra tính hợp lệ của ngày chuẩn SWT301 Lab 2 & Lab 3
 * @param {number|string} day Ngày
 * @param {number|string} month Tháng
 * @param {number|string} year Năm
 * @returns {boolean} true nếu ngày hợp lệ theo lịch, false nếu không hợp lệ
 */
export function checkDate(day, month, year) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return false;
  if (m < 1 || m > 12) return false;
  const maxDays = dayInMonth(m, y);
  return d >= 1 && d <= maxDays;
}
export const CheckDate = checkDate;

export function validateDate(dayInput, monthInput, yearInput) {
  // Chỉ chấp nhận chuỗi chữ số (vd: "29", "08"). Chặn "1e1", "0x10", "5.0", "-3", "".
  const isDigits = value => value !== null && value !== undefined && /^\d+$/.test(String(value).trim());

  if (!isDigits(dayInput)) {
    return { isValid: false, reason: 'Ngày phải là một số nguyên dương.', field: 'day' };
  }
  if (!isDigits(monthInput)) {
    return { isValid: false, reason: 'Tháng phải là một số nguyên dương.', field: 'month' };
  }
  if (!isDigits(yearInput)) {
    return { isValid: false, reason: 'Năm phải là một số nguyên dương.', field: 'year' };
  }

  const day = Number(String(dayInput).trim());
  const month = Number(String(monthInput).trim());
  const year = Number(String(yearInput).trim());

  if (year < 1 || year > 9999) {
    return { isValid: false, reason: 'Năm phải nằm trong khoảng từ 1 đến 9999.', field: 'year' };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, reason: `Tháng ${month} không hợp lệ! Tháng phải từ 1 đến 12.`, field: 'month' };
  }

  const maxDays = getMaxDaysInMonth(month, year);
  const leap = isLeapYear(year);

  if (day < 1 || day > maxDays) {
    let explanation = `Tháng ${month} năm ${year} chỉ có tối đa ${maxDays} ngày.`;
    if (month === 2) {
      explanation += leap
        ? ` (Năm ${year} là năm nhuận, tháng 2 có 29 ngày).`
        : ` (Năm ${year} không phải năm nhuận, tháng 2 chỉ có 28 ngày).`;
    }
    return {
      isValid: false,
      reason: `Ngày ${day} không hợp lệ! ${explanation}`,
      field: 'day',
      maxDays,
      isLeap: leap
    };
  }

  let successMsg = `Ngày ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} là ngày hợp lệ.`;
  if (month === 2 && leap) {
    successMsg += ` (Lưu ý: Năm ${year} là năm nhuận nên tháng 2 có 29 ngày).`;
  }

  return {
    isValid: true,
    reason: successMsg,
    maxDays,
    isLeap: leap
  };
}
