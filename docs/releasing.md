# Releasing

## Version bump

Update the version in **all** of these, and move the `[Unreleased]` entries in `CHANGELOG.md` under the new version heading with its date (and update the link references at the bottom):

- `readme.txt`: Stable tag and Upgrade Notice
- `package.json`: the `version` field
- `bws-block-visibility-acf-datetime-extension.php`: the `Version` header

## Release

CI is the sole release builder. After the version bump is committed, tag and push:

```
git tag v<version>
git push origin v<version>
```

Pushing a `v*` tag runs `.github/workflows/release.yml`, which:

1. Fails unless the tag (minus the `v`) matches the `package.json` version.
2. Runs `npm ci` and `npm run package`.
3. Creates a GitHub release with generated notes and attaches `bws-block-visibility-acf-datetime-extension-<version>.zip`. The job fails if no zip matches.

The plugin-update-checker on live sites reads that release asset.

## Package

`npm run package` is what CI runs, and it works locally too. It builds the JS, creates the zip, then adds the version to the filename:

1. `npm run build` compiles `assets/js/editor-control.js` to `build/` with webpack.
2. `wp-scripts plugin-zip` (WordPress's official tool) creates the zip. Because `package.json` has a `files` list (`build/`, `includes/`, `libs/`, the main PHP file, `uninstall.php`, `readme.txt`, `LICENSE`), only those are packaged. Add any new runtime directory or file there or it will not ship.
3. `rename-zip.js` renames the zip to `bws-block-visibility-acf-datetime-extension-<version>.zip` using the version in `package.json`.

The archive's internal directory is the clean slug, `bws-block-visibility-acf-datetime-extension/`, with no version. The version appears only in the zip filename.

`build/` is gitignored and not committed. Run `npm run build` after a fresh clone or any JS change before testing locally.
