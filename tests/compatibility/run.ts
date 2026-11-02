import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixtures = dirname(fileURLToPath(import.meta.url));
const repository = resolve(fixtures, '../..');
// biome-ignore lint/suspicious/noUndeclaredEnvVars: npm supplies its own CLI path to scripts
const npmCli = process.env.npm_execpath;
assert(npmCli, 'Run this suite with npm run test:compatibility');

function npm(args: string[], cwd: string, capture = false): string {
  assert(npmCli);
  return execFileSync(process.execPath, [npmCli, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
}

const temporary = mkdtempSync(join(tmpdir(), 'cropper-compatibility-'));
try {
  // The npm script builds first. Skip lifecycle scripts here to avoid hook
  // installation and keep packing independent of any future publish checks.
  const packed: unknown = JSON.parse(
    npm(
      ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
      repository,
      true,
    ),
  );
  assert(packed && typeof packed === 'object');
  // npm 11 returns an array; npm 12 returns an object keyed by package name.
  const packages: unknown[] = Array.isArray(packed)
    ? packed
    : Object.values(packed);
  assert.equal(packages.length, 1, 'Expected one packed library');
  const info = packages[0];
  assert(info && typeof info === 'object');
  assert('filename' in info && typeof info.filename === 'string');
  assert.equal(basename(info.filename), info.filename);
  assert('files' in info && Array.isArray(info.files));
  assert.deepEqual(
    info.files
      .map((file: unknown) => {
        assert(file && typeof file === 'object' && 'path' in file);
        assert.equal(typeof file.path, 'string');
        return file.path;
      })
      .sort(),
    [
      'LICENSE',
      'README.md',
      'dist/index.d.ts',
      'dist/index.js',
      'package.json',
    ],
    'Unexpected published files',
  );
  const tarball = join(temporary, info.filename);
  const failures: string[] = [];

  for (const version of ['18', '19']) {
    console.log(`\nChecking packed package with React ${version}`);
    try {
      const consumer = join(temporary, `react${version}`);
      cpSync(join(fixtures, `react${version}`), consumer, {
        recursive: true,
        filter: (source) => basename(source) !== 'node_modules',
      });
      cpSync(join(fixtures, 'consumer'), consumer, { recursive: true });
      cpSync(join(repository, '.npmrc'), join(consumer, '.npmrc'));
      npm(['ci', '--ignore-scripts', '--no-fund'], consumer);
      // The artifact changes each run, so it cannot be part of the fixture lock.
      // All fixture dependencies and the published baseline stay pinned.
      npm(
        [
          'install',
          '--no-save',
          '--package-lock=false',
          '--ignore-scripts',
          '--no-fund',
          tarball,
        ],
        consumer,
      );

      const installed = join(consumer, 'node_modules/cropperjs-react-wrapper');
      for (const file of ['dist/index.js', 'dist/index.d.ts', 'package.json']) {
        assert.equal(
          readFileSync(join(installed, file), 'utf8'),
          readFileSync(join(repository, file), 'utf8'),
          `Installed ${file} differs from the candidate`,
        );
      }
      execFileSync(process.execPath, ['check-types.ts'], {
        cwd: consumer,
        stdio: 'inherit',
      });
      execFileSync(
        process.execPath,
        [
          '--import',
          './setup.ts',
          '--test',
          'legacy.test.ts',
          'readiness.test.ts',
        ],
        { cwd: consumer, stdio: 'inherit' },
      );
    } catch (error) {
      failures.push(version);
      console.error(`React ${version} compatibility failed`, error);
    }
  }
  assert.equal(
    failures.length,
    0,
    `Compatibility failed for React ${failures.join(', ')}`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
