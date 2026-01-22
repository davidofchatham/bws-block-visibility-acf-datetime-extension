/**
 * Package Plugin Script
 *
 * Creates a distributable zip file of the plugin with only necessary files.
 * Excludes development files like node_modules, .git, etc.
 *
 * Usage: npm run package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginSlug = 'bws-block-visibility-acf-datetime-extension';
const version = '0.8.0';
const distDir = path.join(__dirname, 'dist');
const packageDir = path.join(distDir, pluginSlug);
const zipName = `${pluginSlug}-${version}.zip`;

// Files and directories to include in the package
const includePatterns = [
	'assets/**/*',
	'build/**/*',
	'includes/**/*',
	'*.php',
	'readme.txt'
];

// Files and directories to explicitly exclude
const excludePatterns = [
	'node_modules',
	'.git',
	'.github',
	'.claude',
	'dist',
	'package-plugin.js',
	'package.json',
	'package-lock.json',
	'.gitignore',
	'CLAUDE.md',
	'README.md',
	'webpack.config.js',
	'.DS_Store',
	'Thumbs.db'
];

console.log('🔧 Building plugin package...\n');

// Clean up existing dist directory
if (fs.existsSync(distDir)) {
	console.log('Cleaning existing dist directory...');
	fs.rmSync(distDir, { recursive: true, force: true });
}

// Create fresh dist and package directories
console.log('Creating package directory...');
fs.mkdirSync(packageDir, { recursive: true });

// Copy files
console.log('Copying plugin files...\n');

/**
 * Recursively copy directory contents
 */
function copyDirectory(src, dest, level = 0) {
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		// Check if this path should be excluded
		const relativePath = path.relative(__dirname, srcPath);
		const shouldExclude = excludePatterns.some(pattern => {
			return relativePath === pattern || relativePath.startsWith(pattern + path.sep);
		});

		if (shouldExclude) {
			continue;
		}

		if (entry.isDirectory()) {
			fs.mkdirSync(destPath, { recursive: true });
			copyDirectory(srcPath, destPath, level + 1);
		} else {
			const indent = '  '.repeat(level);
			console.log(`${indent}✓ ${relativePath}`);
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

// Copy root level files
const rootFiles = ['readme.txt', 'uninstall.php'];
rootFiles.forEach(file => {
	const srcPath = path.join(__dirname, file);
	if (fs.existsSync(srcPath)) {
		console.log(`✓ ${file}`);
		fs.copyFileSync(srcPath, path.join(packageDir, file));
	}
});

// Copy main plugin file
const mainFile = `${pluginSlug}.php`;
if (fs.existsSync(path.join(__dirname, mainFile))) {
	console.log(`✓ ${mainFile}`);
	fs.copyFileSync(
		path.join(__dirname, mainFile),
		path.join(packageDir, mainFile)
	);
}

// Copy directories
const directories = ['assets', 'build', 'includes'];
directories.forEach(dir => {
	const srcPath = path.join(__dirname, dir);
	if (fs.existsSync(srcPath)) {
		const destPath = path.join(packageDir, dir);
		fs.mkdirSync(destPath, { recursive: true });
		console.log(`\nCopying ${dir}/`);
		copyDirectory(srcPath, destPath, 1);
	}
});

console.log('\n📦 Creating zip file...');

// Create zip file using PowerShell (Windows) or zip command (Unix)
const zipPath = path.join(distDir, zipName);

try {
	if (process.platform === 'win32') {
		// Windows: Use PowerShell Compress-Archive
		const psCommand = `Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${zipPath}' -Force`;
		execSync(`powershell ${psCommand}`, { stdio: 'inherit' });
	} else {
		// Unix/Mac: Use zip command
		const cwd = distDir;
		execSync(`zip -r "${zipName}" "${pluginSlug}"`, { cwd, stdio: 'inherit' });
	}

	console.log('\n✅ Package created successfully!');
	console.log(`\n📍 Location: ${zipPath}`);

	// Get file size
	const stats = fs.statSync(zipPath);
	const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
	console.log(`📊 Size: ${sizeMB} MB`);

	console.log('\n🚀 Ready to install on WordPress!');

} catch (error) {
	console.error('\n❌ Error creating zip file:', error.message);
	process.exit(1);
}
