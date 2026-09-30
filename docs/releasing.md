# Releasing

## Version bump

Update the version in **all** of these, and keep the changelogs matching:

- `readme.txt`: Stable tag and changelog (WordPress.org format)
- `README.md`: version badge and changelog (GitHub format)
- `package.json`: the `version` field
- `bws-block-visibility-acf-datetime-extension.php`: the `Version` header

## Package

`npm run package` builds the JS, creates the zip, then adds the version to the filename:

1. `npm run build` compiles `assets/js/editor-control.js` to `build/` with webpack.
2. `wp-scripts plugin-zip` (WordPress's official tool) creates the zip. It discovers files by WordPress standards, excludes development files, and produces a WordPress-compatible archive.
3. `rename-zip.js` renames the zip to `bws-block-visibility-acf-datetime-extension-<version>.zip` using the version in `package.json`.

The archive's internal directory is the clean slug, `bws-block-visibility-acf-datetime-extension/`, with no version. The version appears only in the zip filename.
