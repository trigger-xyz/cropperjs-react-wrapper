# Repository guidance

This library wraps Cropper.js custom elements for React. Existing consumers use
both JSX props and imperative refs. Preserve both interfaces when adding features.

## Development and review

- Before changing existing behavior, identify the affected public contract and
  check it against the pinned published baseline in `tests/compatibility`.
- Review changes to effects, guards, defaults, refs, and event subscriptions for
  valid existing inputs they could exclude. Optional props are not proof that
  the underlying element has no value or cannot be changed through a ref.
- For image lifecycle changes, consider prop and ref assignment, cached and
  pending loads, source replacement, failure recovery, callback replacement,
  unmounting, and development Strict Mode. Add tests for affected cases.
- Every regression fix needs a test that fails with the faulty implementation
  and passes with the fix. Use a disposable copy when verifying a deliberate
  regression; do not leave broken code in the working tree.
- Keep reusable compatibility checks in the repository and CI. Test the packed
  package in isolated consumers, including the minimum supported React versions.
  Source aliases and example builds do not replace installed-package tests.
- Preserve the baseline tests and their assertions when adding functionality.
  Explain intentional behavior changes and their versioning implications before
  updating the compatibility baseline or weakening an assertion.
- Give repeated reviews distinct scopes: upstream behavior, existing consumer
  contracts, then packaging and release checks. Check public declarations too.
- Report the commands run, their results, and remaining gaps. Passing tests only
  establish the scenarios covered; do not claim universal compatibility.
- Keep runtime changes, dependency upgrades, and tooling changes separately
  reviewable. New dependency versions must be at least 24 hours old.

## Verification

Use the Node version in `.node-version` and npm version in `packageManager`.
Run `npm ci` to install dependencies and the local lint hook.

- `npm run test:compatibility` builds and packs the library, installs it into
  locked React 18 and 19 consumers, and checks legacy behavior and declarations.
  See `tests/compatibility/README.md` for fixture maintenance.
- `npm run verify` runs lint, unit tests, library and example builds, type checks,
  packed-package compatibility, and Chromium and Firefox browser tests.
  Install the browsers first with `npx playwright install chromium firefox`.
- During development, run the checks affected by the change. Before a release,
  run the complete verification on the final code and check CI for that commit.
- Keep the pre-commit hook fast. CI is responsible for the complete suite.
- Run `npm publish --dry-run` to inspect the final package before publishing.
  Do not substitute a build or dry run for the compatibility suite.
