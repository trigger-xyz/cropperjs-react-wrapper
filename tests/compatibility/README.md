# Installed-package compatibility

Run `npm run test:compatibility` with the repository's Node and npm versions.
The command builds the library, checks the tarball file list, and installs the
same tarball into temporary consumers outside the workspace. It removes those
consumers afterwards. Registry access or a populated npm cache is required.

The consumers pin React 18.2.0 and 19.0.0, the minimum supported versions. Their
lockfiles pin test tools, Cropper.js, and the published wrapper 1.2.0 baseline.
The candidate is installed separately because its tarball changes with the code.
Dependency lifecycle scripts are disabled in these test installations.

- `legacy.test.ts` runs the same contracts against the baseline and candidate:
  components, refs, native methods, prop updates, cancelable events, deprecated
  props, and readiness from source props and imperative assignment during mount.
- `readiness.test.ts` checks the candidate's lifecycle guarantees, including
  delayed/replaced sources, cached images, development Strict Mode, callback
  replacement, failure recovery, and cancellation on unmount. These intentional
  improvements are not required of the older baseline.
- `check-types.ts` checks every baseline export and prop name, type
  assignability, and legacy JSX with TypeScript 5.9 and `skipLibCheck: false`.
  The fixture tests are also typechecked against each consumer's dependencies.

These tests import the installed package entry points without source aliases.
jsdom supplies the DOM; image dimensions and load events are simulated. Browser
tests of the example apps separately cover real image loading, layout, and crop
exports. Passing these fixtures does not establish every possible consumer use.

Keep new compatibility scenarios in `consumer` so both React versions run them.
For a regression, first demonstrate that the scenario fails against the broken
candidate. Preserve existing scenarios when updating a baseline.

To update a fixture, edit its package manifest and regenerate its lockfile:

```sh
npm install --prefix tests/compatibility/react18 --package-lock-only --ignore-scripts --min-release-age=1
npm install --prefix tests/compatibility/react19 --package-lock-only --ignore-scripts --min-release-age=1
```

Review dependency changes and rerun the suite. Keep the minimum React versions
unless the peer support policy changes. Update the baseline and pinned Cropper.js
deliberately, documenting any intentionally changed contract.
