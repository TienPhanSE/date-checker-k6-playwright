# Date Checker — k6 + Playwright

> Luôn chạy lệnh trong thư mục có `package.json` (kiểm tra: `dir package.json`).

## Cài đặt (1 lần)

```powershell
winget install OpenJS.NodeJS.LTS
winget install k6 --source winget
# Đóng và mở lại terminal
npm ci
npx playwright install chromium
```

Kiểm tra k6 đã cài thành công: `k6 version`.

## Kiểm thử API

API nhận GET tại `http://127.0.0.1:3001/api/validate-date`, với ba query parameter `day`, `month`, `year`. Không cần request body.

### Bước 1 — Bật API

Terminal 1 (giữ chạy trong suốt quá trình test):

```powershell
npm run api
```

### Bước 2 — Kiểm tra từng trường hợp

Mở các URL sau trên trình duyệt, hoặc dùng Postman chọn GET rồi nhấn Send:

| Trường hợp | URL | Kết quả mong đợi |
|---|---|---|
| Ngày năm nhuận hợp lệ | http://127.0.0.1:3001/api/validate-date?day=29&month=2&year=2024 | HTTP 200, `isValid: true` |
| Ngày năm thường không hợp lệ | http://127.0.0.1:3001/api/validate-date?day=29&month=2&year=2023 | HTTP 200, `isValid: false` |
| Tháng 4 không có ngày 31 | http://127.0.0.1:3001/api/validate-date?day=31&month=4&year=2025 | HTTP 200, `isValid: false` |

Đối chiếu thêm trường `reason` trong JSON để xem lý do. Ngày không hợp lệ vẫn trả HTTP 200 vì API đã xử lý yêu cầu thành công; tính hợp lệ của ngày được biểu diễn bằng `isValid`.

### Bước 3 — Kiểm tra tự động bằng k6

Terminal 2:

```powershell
npm run test:load
```

Script `tests/performance/load.js` mặc định chạy 10 người dùng ảo (VUs) trong 30 giây, luân phiên 3 bộ dữ liệu ở trên. Mỗi request kiểm tra HTTP 200 và `isValid` đúng với kết quả mong đợi. Đây là kiểm tra API cơ bản kết hợp load test; project chưa có bộ API test riêng bằng Playwright/Postman.

Đọc kết quả trong terminal:

| Chỉ số | Điều kiện đạt |
|---|---|
| `http_req_duration` | p95 < 500 ms |
| `http_req_failed` | Tỷ lệ lỗi HTTP < 1% |
| `checks` | 100% kiểm tra thành công |

k6 trả exit code 0 khi chạy thành công và đạt các ngưỡng. Kết quả k6 không nằm trong báo cáo HTML của Playwright.

## Kiểm thử E2E bằng Playwright

E2E mô phỏng người dùng nhập ngày/tháng/năm, nhấn kiểm tra, đối chiếu thông báo và thao tác nút điền mẫu/đặt lại.

### Bước 1 — Chạy toàn bộ E2E

```powershell
npm run test:e2e
```

Playwright tự khởi động web tại `http://localhost:5173` nếu chưa có server chạy ở đó. Không cần chạy `npm run api`: giao diện kiểm tra ngày ngay trên trình duyệt. Cấu hình hiện tại chạy trên Chromium.

### Bước 2 — Đọc kết quả

| File trong `tests/e2e/` | Số test | Nội dung |
|---|---:|---|
| `happy-path.spec.ts` | 4 | Giao diện, ngày hợp lệ và năm nhuận |
| `validation.spec.ts` | 5 | Để trống, ngày/tháng/năm không hợp lệ |
| `edge-cases.spec.ts` | 4 | Năm thế kỷ, giới hạn năm 1–9999 |
| `interactive-presets.spec.ts` | 3 | Nút điền mẫu và nút đặt lại |
| **Tổng** | **16** | |

Kết quả mong đợi khi mọi test thành công: `16 passed`. Đây là kết quả mong đợi, không phải xác nhận mọi lần chạy đều đạt.

### Bước 3 — Xem trình duyệt thao tác hoặc debug

```powershell
# Hiện cửa sổ trình duyệt khi chạy
npm run test:e2e -- --headed

# Chạy từng bước để tìm lỗi
npm run test:e2e -- --debug

# Chạy riêng một file
npx playwright test tests/e2e/validation.spec.ts
```

### Bước 4 — Mở báo cáo

```powershell
npm run report
```

Xem trạng thái từng test, thời gian chạy và chi tiết lỗi. Cấu hình giữ lại trace khi test thất bại. Bấm `Ctrl + C` để tắt server báo cáo.

Báo cáo HTML phản ánh lần chạy Playwright gần nhất. Chạy visual test sau E2E sẽ thay báo cáo E2E bằng báo cáo visual.

## Demo 1 — Visual regression (Playwright), 1 terminal

Tạo ảnh chuẩn trên máy của bạn và kiểm tra ảnh trước khi sử dụng:

```powershell
npm run test:visual:update
```

Sau đó chạy demo:

```powershell
npm run test:visual        # Mong đợi: 3 passed
npm run test:visual:fail   # Mong đợi: 3 failed (cố ý: nút đổi màu đỏ)
npm run report            # Xem Expected / Actual / Diff, Ctrl + C để tắt
npm run test:visual        # Mong đợi: 3 passed trở lại
```

Không cập nhật ảnh chuẩn trong demo FAIL. Chỉ cập nhật sau khi đã kiểm tra và chấp nhận giao diện mới.

## Demo 2 — Performance (k6), 2 terminal

Terminal 1 (để nguyên, không tắt):

```powershell
npm run api
```

Terminal 2:

```powershell
npm run test:load                            # 10 VUs, 30 giây
k6 run -e VUS=50 tests/performance/load.js    # 50 VUs, 30 giây
```

Đối chiếu các ngưỡng ở phần kiểm thử API để kết luận PASS/FAIL.

Demo FAIL: Terminal 1 bấm `Ctrl + C`, chạy `npm run api:slow`, rồi Terminal 2 chạy `npm run test:load`. API thêm độ trễ 700 ms nên p95 vượt ngưỡng 500 ms. Đây là độ trễ nhân tạo để minh họa threshold FAIL, không chứng minh hệ thống quá tải.

Khôi phục: Terminal 1 bấm `Ctrl + C`, chạy lại `npm run api`.

## Lỗi hay gặp

| Lỗi | Cách sửa |
|---|---|
| `Could not read package.json` | Đứng sai thư mục; `cd` vào thư mục có `package.json` |
| `headless_shell.exe doesn't exist` | Chạy `npx playwright install chromium` |
| k6 `actively refused it` | Chưa bật API; chạy `npm run api` ở terminal khác |
| Visual FAIL dù không cố ý sửa gì | Xem Expected / Actual / Diff; kiểm tra môi trường và giao diện. Chỉ chạy `npm run test:visual:update` khi đã chấp nhận ảnh mới |
