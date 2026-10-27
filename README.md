# Date Checker — k6 + Playwright

> Luôn chạy lệnh trong thư mục có `package.json` (kiểm tra: `dir package.json`).

## Cài đặt (1 lần)

```powershell
winget install OpenJS.NodeJS.LTS
winget install k6 --source winget
# Đóng và mở lại terminal
npm ci
npx playwright install chromium
npm run test:visual:update
```

## Demo 1 — Automated Testing (Playwright: Unit, API, E2E)

```powershell
# 1. Chạy 31 Unit Test Cases (hàm DayInMonth & CheckDate)
npm run test:unit          # 31 passed

# 2. Chạy 27 REST API Test Cases (tự động khởi động API server ngầm)
npm run test:api           # 27 passed

# 3. Chạy 17 E2E UI Test Cases
npm run test:e2e           # 17 passed
```

## Demo 2 — Visual regression (Playwright), 1 terminal

```powershell
npm run test:visual        # 3 passed
npm run test:visual:fail   # 3 failed (cố ý: nút đổi màu đỏ)
npm run report             # xem Expected / Actual / Diff, Ctrl + C để tắt
npm run test:visual        # 3 passed trở lại
```

## Demo 3 — Performance (k6), 2 terminal

Terminal 1 (để nguyên, không tắt):
```powershell
npm run api
```

Terminal 2:
```powershell
npm run test:load                # 10 VUs, 30s → PASS
npm run test:load -- -e VUS=50   # 50 VUs → PASS
```

Demo FAIL: Terminal 1 bấm `Ctrl + C` → `npm run api:slow`, rồi Terminal 2 chạy `npm run test:load` (p95 ≈ 700ms > 500ms → FAIL).
Khôi phục: Terminal 1 bấm `Ctrl + C` → `npm run api`.

## Lỗi hay gặp

| Lỗi | Cách sửa |
|---|---|
| `Could not read package.json` | Đứng sai thư mục, `cd` vào thư mục có `package.json` |
| `headless_shell.exe doesn't exist` | `npx playwright install chromium-headless-shell` |
| k6 `actively refused it` | Chưa bật API, chạy `npm run api` ở terminal khác |
| Visual FAIL dù không sửa gì | `npm run test:visual:update` |
