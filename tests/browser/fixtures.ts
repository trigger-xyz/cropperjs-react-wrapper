import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

export const test = base.extend({
  launchOptions: [
    async ({ browserName, launchOptions }, use) => {
      if (browserName !== 'firefox' || process.platform !== 'darwin') {
        await use(launchOptions);
        return;
      }

      // Firefox 157 still looks up the user's shared application data even
      // with a temporary profile. macOS 27 can deny that lookup.
      // https://github.com/microsoft/playwright/issues/42768
      const appDataHome = await mkdtemp(
        join(tmpdir(), 'cropper-firefox-home-'),
      );
      try {
        // Creating these ourselves avoids macOS adding deny-delete ACLs,
        // allowing teardown to remove the entire temporary directory.
        await Promise.all(
          ['Downloads', 'Library/Application Support', 'Library/Caches'].map(
            (directory) =>
              mkdir(join(appDataHome, directory), { recursive: true }),
          ),
        );
        await use({
          ...launchOptions,
          env: {
            ...process.env,
            ...launchOptions.env,
            CFFIXED_USER_HOME: appDataHome,
          },
        });
      } finally {
        await rm(appDataHome, { recursive: true, force: true });
      }
    },
    { scope: 'worker' },
  ],
});
