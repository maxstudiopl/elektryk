import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  testMatch:'browser-smoke-v0720.spec.mjs',
  timeout:45_000,
  expect:{timeout:10_000},
  retries:1,
  workers:1,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:4173',...devices['Desktop Chrome'],trace:'retain-on-failure'},
  webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',
    url:'http://127.0.0.1:4173/',reuseExistingServer:false,timeout:30_000}
});