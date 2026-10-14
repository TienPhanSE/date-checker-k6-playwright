# Date Checker — k6 + Playwright

> Luôn chạy lệnh trong thư mục có `package.json` (kiểm tra: `dir package.json`).

## Đọc trước khi chạy — lệnh nào dùng được ngay?

README có cả hướng dẫn sử dụng code hiện có và bài hướng dẫn tự tạo file mới. Không chạy lần lượt mọi khối lệnh từ trên xuống: các terminal server phải giữ mở, lệnh tạo lỗi demo sẽ cố ý FAIL, còn code JavaScript/JSON/YAML phải lưu vào file chứ không dán vào terminal.

| Lệnh | Trạng thái trên nhánh main lúc rà soát |
|---|---|
| `npm run test:e2e` | Đã có script và 16 test |
| `npm run test:visual` | Đã có 3 test; lần đầu cần tạo và xem ảnh chuẩn |
| `npm run api`, `npm run test:load` | Đã có; cần cài k6 và bật API ở terminal riêng |
| `npm run report` | Đã có; cần chạy Playwright trước để có báo cáo |
| `npm run test:unit` | Chưa có script; phải làm các bước tạo file và thêm script ở bài Unit trước |
| `node --test tests/unit/date-validator.test.js` | Chỉ chạy sau khi đã tạo file unit theo hướng dẫn |
| `node tests/mobile/android.mjs` | Chỉ chạy sau khi tạo file, cài WebdriverIO, thiết lập Android và bật Appium |
| `npx playwright test tests/e2e/ai-generated.spec.ts --headed` | Chỉ chạy sau khi AI đã tạo file đó |
| GitHub Actions / MCP | Cần tự tạo file cấu hình theo bài hướng dẫn; chưa được cài chỉ bằng việc cập nhật README |

### Kiểm tra đúng thư mục và nhánh

Trong terminal VS Code, chạy:

```powershell
Get-Location
Test-Path .\package.json
git branch --show-current
git status
npm run
```

`Test-Path` phải trả `True`. Nếu `False`, mở đúng thư mục project chứa `package.json`; ZIP cũ có thể có hai lớp thư mục cùng tên. `npm run` liệt kê script thực sự có trên máy bạn.

Nếu làm với bản clone Git và muốn lấy README mới trên main, chỉ chuyển nhánh/pull khi đã lưu hoặc commit thay đổi của mình:

```powershell
git switch main
git pull --ff-only
```

Nếu dùng ZIP tải về thì không dùng `git pull`; tải bản ZIP mới hoặc tự cập nhật file cần thiết. Không xóa thay đổi cá nhân để ép pull.

### Chạy E2E trước để kiểm tra môi trường

Cài Node.js LTS nếu chưa có, mở lại VS Code, rồi chạy từng dòng:

```powershell
node -v
npm -v
npm ci
npx playwright install chromium
npm run test:e2e
```

Mong đợi 16 passed nếu bộ E2E hiện có chạy thành công. Xem trình duyệt bằng `npm run test:e2e -- --headed`.

- Nếu PowerShell báo `npm.ps1 cannot be loaded ... running scripts is disabled`: dùng terminal **Command Prompt** trong VS Code, hoặc thay `npm` bằng `npm.cmd` và `npx` bằng `npx.cmd` trong các lệnh. Không cần đổi execution policy chỉ để chạy npm.
- Nếu `npm ci` báo thiếu/không đồng bộ lockfile: xác nhận đang ở đúng project. Nếu bạn chủ động sửa dependencies, dùng `npm install` để cập nhật lockfile, rồi commit cả `package.json` và `package-lock.json`.
- Nếu chỉ `npm ci` báo lỗi tải package, xem dòng lỗi đầu tiên (mạng/registry/phiên bản/quyền truy cập); không thể sửa chỉ bằng cách cài browser.
- Nếu `Port 5173 is already in use`: kiểm tra terminal Vite đang chạy. Nếu đúng project thì dùng lại; nếu đang chạy project khác, dừng server đó bằng Ctrl+C rồi chạy lại test. Không đổi cổng tùy ý vì cấu hình test dùng 5173.
- Nếu `EADDRINUSE` trên 3001: API có thể đã chạy ở terminal khác; không mở thêm API trùng cổng.
- Nếu `k6 is not recognized`: cài k6 theo phần cài đặt rồi đóng/mở lại terminal.
- Nếu `Missing script: test:unit`: làm bước thêm script trong bài Unit; pull README không tự thêm script.
- Nếu `Could not find ...date-validator.test.js` hoặc `Cannot find module ...android.mjs`: file bài thực hành chưa được tạo hoặc bạn đang đứng sai thư mục.
- Nếu visual FAIL: đọc diff trước, không update baseline chỉ để biến lỗi thành PASS.
- Dùng các lệnh có phạm vi `npm run test:e2e` và `npm run test:visual`. Sau khi thêm test Node, lệnh Playwright không có bộ lọc `npx playwright test` có thể đọc nhầm file `.test.js` của Node.

Khi cần hỗ trợ, gửi nguyên câu lệnh đã chạy và toàn bộ lỗi trong terminal; chỉ thông báo “không chạy được” chưa đủ xác định lỗi trên máy.



## Cài đặt (1 lần)

```powershell
winget install --id OpenJS.NodeJS.LTS --exact --source winget
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


## Học tiếp 4 mục còn lại — từ dễ đến khó

Các bước dưới đây là hướng dẫn tự bổ sung và chạy thử; việc có hướng dẫn trong README không có nghĩa các công cụ, file test hay pipeline này đã được cài/chạy thành công. Thực hiện trên máy của bạn, trong thư mục có `package.json`. Sau khi README được cập nhật trên GitHub, lấy nội dung mới về bằng `git pull --ff-only` khi working tree sạch.

| Thứ tự | Mục | Công cụ | Vì sao học theo thứ tự này |
|---|---|---|---|
| 1 | Unit testing | Node.js test runner | Có sẵn trong Node, dùng ngay các hàm hiện có |
| 2 | CI/CD & reporting | GitHub Actions + Playwright HTML | Tự động hóa bộ E2E đã có |
| 3 | AI-assisted testing | Playwright MCP + AI client | Cần cài và kết nối MCP, kiểm tra lại kết quả AI |
| 4 | Mobile testing | Appium + Android Emulator | Cần SDK, JDK, thiết bị, driver và client |

CI/CD và AI-assisted là cách hỗ trợ/tự động hóa kiểm thử, không phải cấp độ test độc lập như Unit hay E2E.

### 1 — Unit testing: dễ nhất

Dùng test runner tích hợp của Node.js, không cần cài Jest/Vitest. Dùng Node.js 22.12 trở lên cho lộ trình này; kiểm tra bằng `node -v`.

**Bước 1.** Tạo thư mục bằng PowerShell:

```powershell
New-Item -ItemType Directory -Force tests/unit
```

Trong VS Code tạo file `tests/unit/date-validator.test.js`, dán và lưu đoạn JavaScript dưới đây vào file (không dán vào terminal):

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { isLeapYear, getMaxDaysInMonth, validateDate } from '../../src/date-validator.js';

test('2024 là năm nhuận', () => {
  assert.equal(isLeapYear(2024), true);
});
test('1900 không phải năm nhuận', () => {
  assert.equal(isLeapYear(1900), false);
});
test('2000 là năm nhuận', () => {
  assert.equal(isLeapYear(2000), true);
});
test('Tháng 2/2024 có 29 ngày', () => {
  assert.equal(getMaxDaysInMonth(2, 2024), 29);
});
test('Tháng 4 có 30 ngày', () => {
  assert.equal(getMaxDaysInMonth(4, 2025), 30);
});
test('29/02/2024 hợp lệ', () => {
  assert.equal(validateDate('29', '2', '2024').isValid, true);
});
test('29/02/2023 không hợp lệ', () => {
  assert.equal(validateDate('29', '2', '2023').isValid, false);
});
test('Ngày trống báo đúng trường day', () => {
  const result = validateDate('', '2', '2024');
  assert.equal(result.isValid, false);
  assert.equal(result.field, 'day');
});
test('Năm 10000 nằm ngoài giới hạn', () => {
  const result = validateDate('1', '1', '10000');
  assert.equal(result.isValid, false);
  assert.equal(result.field, 'year');
});
```

**Bước 2.** Chạy, không cần mở web hay API:

```powershell
node --test tests/unit/date-validator.test.js
```

Mong đợi: 9 test pass, 0 fail. Nếu lỗi import, kiểm tra đúng tên file và đường dẫn.

**Bước 3.** Nếu muốn dùng `npm run test:unit`, bắt buộc thêm script sau. Có thể dùng lệnh dưới đây để thêm đúng JSON (chạy trong thư mục project):

```powershell
npm pkg set "scripts.test:unit=node --test tests/unit/date-validator.test.js"
```

Script được thêm vào object `scripts` của `package.json` là:

```json
"test:unit": "node --test tests/unit/date-validator.test.js"
```

Sau đó chạy `npm run test:unit`. Test này gọi trực tiếp từng hàm; khác với E2E thao tác qua trình duyệt.

Tài liệu: https://nodejs.org/api/test.html

### 2 — CI/CD & reporting: tự chạy E2E trên GitHub

Bài này thiết lập **CI và báo cáo**, chưa triển khai website (CD). Không cần cài Jenkins/Allure.

**Bước 1.** Chạy `npm run test:e2e` trên máy trước. Nếu fail, sửa lỗi trước khi đưa lên CI.

**Bước 2.** Kiểm tra thư mục `.github/workflows`: nếu đã có workflow tương tự thì sửa file đó để tránh chạy trùng. Nếu chưa có, tạo `.github/workflows/playwright-e2e.yml`:

```yaml
name: Playwright E2E

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-e2e-report
          path: playwright-report/
          retention-days: 7
```

Workflow chỉ chạy E2E để không bị ảnh hưởng bởi ảnh chuẩn visual khác nhau giữa Windows/Linux.

**Bước 3.** Commit và push file workflow bằng VS Code Source Control hoặc GitHub. Nếu làm trên nhánh riêng, mở pull request vào `main`; workflow chạy cho pull request đó.

**Bước 4.** Mở repo → **Actions** → **Playwright E2E** → chọn lần chạy. Sau khi workflow nằm trên nhánh mặc định, có thể dùng **Run workflow** để chạy thủ công.

Mong đợi: job màu xanh, bước test báo 16 passed. Nếu đỏ, mở bước thất bại để đọc log; lỗi cài đặt chưa đồng nghĩa lỗi chức năng.

**Bước 5.** Trong trang lần chạy, tải artifact `playwright-e2e-report`, giải nén rồi mở bằng:

```powershell
npx playwright show-report "DUONG_DAN_THU_MUC_BAO_CAO"
```

Thay đường dẫn bằng thư mục chứa `index.html` vừa giải nén.

Tài liệu: https://playwright.dev/docs/ci

### 3 — AI-assisted testing: Playwright MCP

Cần một AI client hỗ trợ MCP. Ví dụ dưới đây dùng VS Code với GitHub Copilot ở chế độ Agent; cần tài khoản/quyền sử dụng phù hợp. Plugin GitHub trong ChatGPT không tự cài MCP vào VS Code.

**Bước 1.** Kiểm tra Node và cài browser:

```powershell
node -v
npx playwright install chromium
```

**Bước 2.** Trong VS Code, tạo `.vscode/mcp.json` (nếu đã có thì thêm server, giữ cấu hình cũ):

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Đây là định dạng dành cho VS Code; các AI client khác có thể dùng khóa cấu hình khác.

**Bước 3.** Khởi động web ở terminal:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

**Bước 4.** Trong VS Code chạy lệnh **MCP: List Servers**, chọn server Playwright và khởi động. Mở Copilot Chat chế độ Agent, kiểm tra các tool Playwright có sẵn; xử lý hộp thoại tin cậy/quyền công cụ của client nếu được hiển thị.

**Bước 5.** Gửi yêu cầu:

> Dùng các tool Playwright MCP mở http://127.0.0.1:5173. Kiểm tra 29/02/2024 cho kết quả HỢP LỆ, 29/02/2023 cho kết quả KHÔNG HỢP LỆ và nút Đặt lại xóa ba ô nhập, ẩn kết quả. Thực sự thao tác trên trình duyệt, báo kết quả quan sát của từng trường hợp; không sửa code ứng dụng.

Mong đợi: thấy tool được gọi và trình duyệt được thao tác; báo cáo 3 trường hợp kèm kết quả thực tế. Chỉ câu trả lời văn bản của AI chưa đủ chứng minh test đã chạy.

**Bước 6.** Khi đã quan sát được thao tác, có thể yêu cầu AI tạo file `tests/e2e/ai-generated.spec.ts` cho ba trường hợp trên. Đọc và kiểm tra assertion rồi chạy:

```powershell
npx playwright test tests/e2e/ai-generated.spec.ts --headed
```

Lệnh này chỉ chạy sau khi file đã được tạo. Nếu có đúng 3 test và đều đạt, mong đợi 3 passed. Tổng số E2E của repo sẽ tăng sau khi thêm file này.

Tài liệu và cấu hình client: https://github.com/microsoft/playwright-mcp

### 4 — Mobile testing: Appium trên Android (khó nhất)

Repo hiện là website, chưa có APK/iOS app. Bài này kiểm thử **website trên Chrome Android trong emulator**, không phải kiểm thử ứng dụng native. Thu nhỏ cửa sổ desktop không thay thế bước này.

**Bước 1 — Chuẩn bị môi trường Windows.**

- Cài Android Studio từ https://developer.android.com/studio.
- Trong SDK Manager cài Android SDK Platform, Platform-Tools, Command-line Tools và Android Emulator.
- Dùng JDK tương thích với driver (UiAutomator2 hiện yêu cầu JDK 9 trở lên; có thể dùng JDK 17). Cấu hình `JAVA_HOME` trỏ tới JDK.
- Cấu hình `ANDROID_HOME` trỏ đúng Android SDK Location hiển thị trong Android Studio; thêm thư mục `platform-tools` trong SDK vào PATH.
- Trong Device Manager tạo Android Virtual Device có Chrome (system image có Google Play phù hợp), bật emulator và hoàn tất màn hình chào của Chrome.
- Dùng Node.js 22.12 trở lên và npm 10 trở lên. Kiểm tra yêu cầu mới nhất trong tài liệu Appium trước khi cài.

**Bước 2 — Cài Appium, driver và client JavaScript.**

```powershell
npm install -g appium
appium driver install uiautomator2
appium driver doctor uiautomator2
npm install -D webdriverio
adb devices
```

Mong đợi: doctor không còn thiếu dependency bắt buộc; `adb devices` hiển thị emulator ở trạng thái `device`. Ghi lại mã thiết bị, ví dụ `emulator-5554`.

**Bước 3 — Bật web và Appium ở hai terminal riêng.**

Terminal 1:

```powershell
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Trong Chrome của Android Emulator, mở `http://10.0.2.2:5173`. Phải thấy trang Date Checker trước khi chạy automation. `10.0.2.2` là địa chỉ tới máy host của Android Emulator; không dùng địa chỉ này cho điện thoại thật.

Terminal 2:

```powershell
appium
```

**Bước 4 — Tạo file `tests/mobile/android.mjs`.**

```javascript
import assert from 'node:assert/strict';
import { remote } from 'webdriverio';

const driver = await remote({
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    browserName: 'Chrome',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:udid': process.env.ANDROID_UDID || 'emulator-5554',
  },
});

try {
  await driver.url('http://10.0.2.2:5173');
  await driver.$('#day').waitForDisplayed({ timeout: 15000 });

  for (const [year, expected] of [
    ['2024', 'HỢP LỆ'],
    ['2023', 'KHÔNG HỢP LỆ'],
  ]) {
    await driver.$('#day').setValue('29');
    await driver.$('#month').setValue('2');
    await driver.$('#year').setValue(year);
    await driver.$('#btn-check').click();
    await driver.waitUntil(
      async () => (await driver.$('#result-status-badge').getText()) === expected,
      { timeout: 5000, timeoutMsg: 'Sai kết quả ngày 29/02/' + year },
    );
    console.log('PASS: 29/02/' + year);
  }

  await driver.$('#btn-reset').click();
  for (const id of ['day', 'month', 'year']) {
    assert.equal(await driver.$('#' + id).getValue(), '');
  }
  assert.equal(await driver.$('#result-box').isDisplayed(), false);
  console.log('PASS: Reset');
} finally {
  await driver.deleteSession();
}
```

**Bước 5 — Chạy ở terminal thứ ba.**

Nếu mã emulator khác ví dụ, đặt đúng mã bằng PowerShell:

```powershell
$env:ANDROID_UDID = "emulator-5554"
node tests/mobile/android.mjs
```

Mong đợi: Chrome trên emulator tự thao tác và terminal in ba dòng PASS. Script dừng với lỗi nếu assertion hoặc thao tác thất bại. Đây là script riêng, không sinh báo cáo HTML Playwright.

**Lỗi thường gặp:**

| Lỗi | Cách xử lý |
|---|---|
| Không thấy thiết bị | Bật emulator, kiểm tra PATH và chạy lại `adb devices` |
| Thiếu Java/SDK | Chạy doctor, sửa `JAVA_HOME`/`ANDROID_HOME` và mở lại terminal |
| Không mở được web | Kiểm tra terminal Vite còn chạy, dùng đúng `10.0.2.2:5173` trong emulator |
| ChromeDriver không tương thích | Xem phiên bản Chrome trong emulator và tải ChromeDriver tương thích từ nguồn chính thức; thêm capability `appium:chromedriverExecutable` trỏ tới đường dẫn tuyệt đối của file driver, rồi chạy lại |
| Không kết nối Appium | Kiểm tra terminal Appium đang lắng nghe cổng 4723 |

Tài liệu: https://appium.io/docs/en/latest/quickstart/requirements/ và https://github.com/appium/appium-uiautomator2-driver

### Ghi nhận kết quả sau khi tự chạy

Chỉ đánh dấu PASS khi đã chạy và xem kết quả thật. Ghi ngày chạy, phiên bản công cụ, số test pass/fail và ảnh/log tương ứng. Bốn hướng dẫn trên chưa phải bằng chứng bốn mục đã hoàn thành.
