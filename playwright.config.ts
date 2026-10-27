import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['line']],
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.api\.spec\.ts/,
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: 'http://127.0.0.1:3001',
      },
    },
  ],
  webServer: [
    {
      command: 'npx vite --host 127.0.0.1 --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'node server/index.js',
      url: 'http://127.0.0.1:3001/api/validate-date?day=1&month=1&year=2024',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
