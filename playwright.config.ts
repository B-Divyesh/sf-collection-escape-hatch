import { defineConfig, devices } from '@playwright/test';

const testBaseUrl = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './site/tests',
  fullyParallel: true,
  reporter: 'line',
  use: { baseURL: testBaseUrl, trace: 'retain-on-failure' },
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'node scripts/serve-site.mjs', url: testBaseUrl, reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
