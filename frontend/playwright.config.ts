import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env['CITAS_TEST_URL'] || 'http://localhost:4200',
    timezoneId: 'America/Santo_Domingo',
    locale: 'es-DO',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE'] }
  },
  reporter: 'list'
});
