import { defineConfig } from '@playwright/test';

const base = process.env.NAMIBONE_DOCS_BASE ?? '/docs';
const port = 4332;
const url = `http://127.0.0.1:${port}${base.replace(/\/$/, '')}/`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: url,
    launchOptions: { executablePath: process.env.NAMIBONE_CHROMIUM_EXECUTABLE },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run preview -- --ignore-lock --host 127.0.0.1 --port ${port}`,
    url,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
