/**
 * Rename Plugin Zip with Version
 *
 * Renames the wp-scripts generated zip file to include the version number.
 * Reads version from package.json and renames:
 *   pluginSlug.zip -> pluginSlug-version.zip
 */

const fs = require('fs');
const path = require('path');

// Read package.json to get version
const packageJson = require('./package.json');
const version = packageJson.version;
const pluginSlug = packageJson.name;

const oldName = `${pluginSlug}.zip`;
const newName = `${pluginSlug}-${version}.zip`;

const oldPath = path.join(__dirname, oldName);
const newPath = path.join(__dirname, newName);

// Check if the zip file exists
if (!fs.existsSync(oldPath)) {
	console.error(`❌ Error: ${oldName} not found`);
	process.exit(1);
}

// Remove old versioned zip if it exists
if (fs.existsSync(newPath)) {
	fs.unlinkSync(newPath);
}

// Rename the file
fs.renameSync(oldPath, newPath);

console.log(`✅ Renamed to: ${newName}`);
