import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60_000,
  reporter: [['list'],['html',{open:'never'}]],
  use: { baseURL: 'http://127.0.0.1:4173', trace:'retain-on-failure' },
  projects: [
    { name:'chromium', use:{browserName:'chromium'} },
    { name:'firefox', use:{browserName:'firefox'} },
    { name:'webkit', use:{browserName:'webkit'} },
  ],
  webServer: { command:'npm run dev', url:'http://127.0.0.1:4173', reuseExistingServer:!process.env.CI },
});
