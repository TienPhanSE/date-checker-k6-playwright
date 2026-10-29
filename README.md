# Date Checker — k6 + Playwright + Appium

> **Lưu ý quan trọng:** Luôn mở terminal trong thư mục chứa file `package.json` (kiểm tra: `Get-Location` và `Test-Path .\package.json`).

---

## ⚡ BẢNG TỔNG HỢP TOÀN BỘ CÂU LỆNH CHẠY TEST (CHEATSHEET)

Dưới đây là toàn bộ các câu lệnh dùng để thực thi **6 loại kiểm thử** có trong dự án:

| Loại kiểm thử | Câu lệnh thực thi | Kết quả mong đợi | Ghi chú |
|---|---|:---:|---|
| **1. Unit Test** | `npm run test:unit` | `31 passed` | Chạy 31 Test Cases cho 2 hàm `DayInMonth` và `CheckDate` |
| **Unit Test (Node native)** | `node --test tests/unit/date-validator.test.js` | `9 passed` | Chạy bằng test runner tích hợp sẵn của Node.js |
| **2. API Test** | `npm run test:api` | `27 passed` | Test 27 kịch bản REST API (`GET /api/validate-date`), tự động bật server ngầm |
| **3. Desktop E2E Test** | `npm run test:e2e` | `17 passed` | Chạy 17 kịch bản giao diện người dùng trên máy tính (chế độ ẩn browser) |
| **E2E (Mở browser)** | `npm run test:e2e -- --headed` | `17 passed` | Mở trực tiếp cửa sổ trình duyệt Chromium để quan sát thao tác tự động |
| **E2E (Chế độ Debug)** | `npm run test:e2e -- --debug` | Dừng từng bước | Mở Playwright Inspector để debug từng dòng lệnh |
| **E2E (Chạy 1 file)** | `npx playwright test tests/e2e/happy-path.spec.ts` | `4 passed` | Chỉ chạy riêng 1 file kịch bản mong muốn |
| **4. Mobile Web Test (Pixel 7)** | `npm run test:mobile` | `5 passed` | Mô phỏng màn hình điện thoại Android Google Pixel 7 (Touch, 412x915) |
| **Mobile Appium Test** | `npm run test:appium` | `5 passed` | Điều khiển Chrome trên máy ảo **Android Studio Emulator** thật qua Appium |
| **5. Visual Regression** | `npm run test:visual` | `3 passed` | So sánh ảnh chụp màn hình thực tế với ảnh chuẩn baseline từng pixel |
| **Visual Test (Demo FAIL)** | `npm run test:visual:fail` | `3 failed` | Cố ý đổi màu nút bấm sang đỏ để minh họa cơ chế bắt lỗi visual |
| **Visual Test (Update ảnh)** | `npm run test:visual:update` | `3 passed` | Cập nhật lại ảnh chụp màn hình chuẩn mới khi thay đổi giao diện |
| **6. Performance / Load Test** | `npm run test:load` | `p95 < 500ms` | Tải 10 VUs trong 30 giây bằng Grafana k6 (cần bật `npm run api` ở terminal 1) |
| **Load Test (Tải cao)** | `npm run test:load -- -e VUS=50` | `p95 < 500ms` | Tải nặng 50 VUs trong 30 giây |
| **Xem báo cáo HTML** | `npm run report` | Mở trình duyệt | Xem báo cáo trực quan Playwright HTML Report (Bấm `Ctrl + C` để tắt) |

---

## 🛠️ Cài đặt môi trường ban đầu (Chỉ chạy 1 lần)

```powershell
# 1. Cài đặt Node.js LTS và công cụ k6 (nếu chưa có)
winget install --id OpenJS.NodeJS.LTS --exact --source winget
winget install k6 --source winget

# 2. Đóng và mở lại Terminal, sau đó cài dependencies
npm ci

# 3. Cài đặt trình duyệt Playwright Chromium
npx playwright install chromium

# 4. Tạo ảnh chụp màn hình baseline cho Visual test
npm run test:visual:update
```

---

## 📖 HƯỚNG DẪN CHI TIẾT TỪNG LOẠI KIỂM THỬ

### 1. Kiểm thử đơn vị (Unit Testing)
Kiểm tra tính đúng đắn của logic tính toán ngày tháng (`isLeapYear`, `DayInMonth`, `CheckDate`) hoàn toàn không phụ thuộc UI hay server mạng:

```powershell
# Chạy bộ 31 Test Cases chuẩn môn SWT301 bằng Playwright
npm run test:unit

# Hoặc chạy bộ 9 Test Cases bằng Node.js Test Runner tích hợp
node --test tests/unit/date-validator.test.js
```

---

### 2. Kiểm thử API (REST API Testing)
API backend nhận request tại `http://127.0.0.1:3001/api/validate-date?day=...&month=...&year=...`:

```powershell
# Tự động khởi động API server ngầm và chạy 27 Test Cases API
npm run test:api
```

*(Bộ test kiểm tra đầy đủ các trường hợp: ngày hợp lệ, ngày không hợp lệ, bỏ trống trường, nhập ký tự chữ, số âm, số thực, ngoài khoảng 1..9999, bắt lỗi bảo mật method POST/PUT/DELETE và lỗi 404).*

---

### 3. Kiểm thử giao diện người dùng Desktop (E2E Testing)
Playwright tự động khởi động web tại `http://localhost:5173` và mô phỏng người dùng nhập dữ liệu, click nút, kiểm tra thông báo:

```powershell
# Chạy toàn bộ 17 test E2E (chạy ngầm, nhanh)
npm run test:e2e

# Chạy mở cửa sổ trình duyệt Chromium để xem thao tác thực tế
npm run test:e2e -- --headed

# Mở trình duyệt xem báo cáo kết quả chi tiết
npm run report
```

---

### 4. Kiểm thử trên thiết bị di động (Mobile Web Testing)

#### Cách 1: Mô phỏng điện thoại Android Pixel 7 (Nhanh & Tiện lợi)
Không cần cài đặt hay mở máy ảo nặng máy, Playwright tự cấu hình kích thước màn hình điện thoại ($412 \times 915$), User-Agent Chrome Mobile và sự kiện cảm ứng chạm (Touch):

```powershell
npm run test:mobile
```

#### Cách 2: Kiểm thử trên máy ảo Android Studio Emulator với Appium
Tự động mở trình duyệt Chrome trên máy ảo Android thật để chạy kịch bản kiểm thử:

1. **Khởi động máy ảo Android:** Mở Android Studio $\rightarrow$ Device Manager $\rightarrow$ Bấm nút **Play (▶)** tại máy ảo `Pixel_10`.
2. **Terminal 1:** Khởi động Web App cho phép mạng ngoài kết nối:
   ```powershell
   npm run dev -- --host 0.0.0.0 --port 5173
   ```
3. **Terminal 2:** Bật Appium Server:
   ```powershell
   npx appium
   ```
4. **Terminal 3:** Khởi chạy kịch bản kiểm thử:
   ```powershell
   npm run test:appium
   ```

*(Lưu ý: Trong máy ảo Android, trình duyệt kết nối với máy tính qua IP `http://10.0.2.2:5173`).*

---

### 5. Kiểm thử hồi quy giao diện (Visual Regression Testing)

So sánh ảnh chụp màn hình của trang web với ảnh mẫu chuẩn để phát hiện sai lệch CSS/giao diện:

```powershell
# Bước 1: Chạy kiểm tra bình thường (Mong đợi: 3 passed)
npm run test:visual

# Bước 2: Chạy demo lỗi cố ý đổi màu nút sang đỏ (Mong đợi: 3 failed)
npm run test:visual:fail

# Bước 3: Mở báo cáo xem so sánh Expected / Actual / Diff ảnh
npm run report

# Bước 4: Chạy kiểm tra lại sau khi khôi phục (Mong đợi: 3 passed)
npm run test:visual
```

---

### 6. Kiểm thử hiệu năng & độ chịu tải (Performance / Load Testing với k6)

Kiểm tra độ chịu tải và thời gian phản hồi của backend API khi có nhiều người dùng đồng thời:

* **Terminal 1:** Khởi động API Server:
  ```powershell
  npm run api
  ```
* **Terminal 2:** Chạy k6 load test:
  ```powershell
  # Chạy kiểm thử tải chuẩn (10 người dùng ảo VUs trong 30 giây)
  npm run test:load

  # Chạy kiểm thử tải cao (50 người dùng ảo VUs trong 30 giây)
  npm run test:load -- -e VUS=50
  ```

* **Demo kịch bản quá tải/độ trễ cao:**
  1. Ở Terminal 1: Bấm `Ctrl + C` tắt API, sau đó bật chế độ trễ: `npm run api:slow`
  2. Ở Terminal 2: Chạy `npm run test:load` $\rightarrow$ Kết quả sẽ **FAIL** do $p95 \approx 700\text{ ms} > 500\text{ ms}$.
  3. Khôi phục: Ở Terminal 1 bấm `Ctrl + C` và chạy lại `npm run api`.

---

## 🚀 TỰ ĐỘNG HÓA CI/CD TRÊN GITHUB ACTIONS

Toàn bộ các bộ kiểm thử trên (Unit, API, E2E, K6 Load Test) đã được cấu hình trong file [`.github/workflows/ci.yml`](.github/workflows/ci.yml). 

Mỗi khi bạn đẩy code lên GitHub:
```powershell
git add .
git commit -m "feat: update project"
git push origin main
```
GitHub Actions sẽ tự động khởi động máy chủ ảo Ubuntu, chạy khép kín toàn bộ các tầng test và xuất báo cáo kết quả Playwright HTML Report lưu trữ tại mục **Actions** trên GitHub.

---

## ❓ Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `Could not read package.json` | Đang đứng sai thư mục | Dùng `cd` di chuyển vào đúng thư mục dự án chứa `package.json` |
| `headless_shell.exe doesn't exist` | Thiếu browser Chromium | Chạy lệnh `npx playwright install chromium` |
| k6 báo lỗi `actively refused it` | Chưa bật API server | Chạy `npm run api` ở một cửa sổ terminal khác trước khi chạy k6 |
| Visual test bị FAIL dù không sửa code | Khác biệt render giữa các máy | Chạy `npm run test:visual:update` để lấy lại ảnh chụp chuẩn trên máy bạn |
| Port `5173` hoặc `3001` bị chiếm dụng | Có server đang chạy ngầm | Tắt các cửa sổ terminal cũ hoặc kết thúc tiến trình node đang chạy |
