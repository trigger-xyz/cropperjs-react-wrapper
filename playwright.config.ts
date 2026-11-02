import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 960 },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'vite-react19', use: { baseURL: 'http://127.0.0.1:4173' } },
    { name: 'vite-react18', use: { baseURL: 'http://127.0.0.1:4174' } },
    { name: 'nextjs-react19', use: { baseURL: 'http://127.0.0.1:4175' } },
  ],
  webServer: [
    {
      command:
        'npm exec -- vite preview -c vite.demo.config.ts --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
    },
    {
      command:
        'npm exec --workspace @cropperjs-react-wrapper/example-react18 -- vite preview --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174',
    },
    {
      command:
        'npm run start --workspace @cropperjs-react-wrapper/example-nextjs -- --hostname 127.0.0.1 --port 4175',
      url: 'http://127.0.0.1:4175',
    },
  ],
});
