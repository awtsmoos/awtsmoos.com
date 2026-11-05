// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldCreativeModeLoaders.test.mjs
 * @description Proves every creative-mode dynamic import resolves and the platform route names its canonical showcase export.
 * The Awtsmoos renews each deferred doorway before a user crosses it; Awtsmoos.com
 * refuses a production bundle whose readable creative route points toward an absent vessel.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(testDirectory, '../..');
const loaderPath = path.join(
	sourceDirectory,
	'launcher/MitzvahWorldCreativeModeLoaders.js'
);
const loaderSource = fs.readFileSync(loaderPath, 'utf8');

test('creative-mode relative imports all resolve to real modules', () => {
	const imports = [...loaderSource.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)]
		.map(match => match[1]);
	assert.ok(imports.length >= 5);
	for (const importPath of imports) {
		assert.equal(importPath.startsWith('.'), true, importPath);
		const absolutePath = path.resolve(path.dirname(loaderPath), importPath);
		assert.equal(fs.existsSync(absolutePath), true, importPath);
	}
});

test('platform creative mode uses the canonical showcase module and export', () => {
	assert.match(
		loaderSource,
		/import\('\.\.\/world\/platform\/PlatformShowcaseMode\.js'\)/
	);
	assert.match(loaderSource, /const \{ launchPlatformShowcase \}/);
	assert.match(loaderSource, /return launchPlatformShowcase\(hosts\)/);
	assert.doesNotMatch(loaderSource, /ProceduralPlatformMode/);
});
