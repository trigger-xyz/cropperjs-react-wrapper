import { existsSync } from 'node:fs';

if (
  !process.env.CI &&
  process.env.NODE_ENV !== 'production' &&
  // biome-ignore lint/suspicious/noUndeclaredEnvVars: hook installation runs outside Turbo tasks
  process.env.HUSKY !== '0' &&
  existsSync('.git')
) {
  const { default: husky } = await import('husky');
  const error = husky();
  if (error) throw new Error(error);
}
