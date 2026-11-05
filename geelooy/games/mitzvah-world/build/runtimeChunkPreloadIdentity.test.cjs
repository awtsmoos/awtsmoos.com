//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runtimeChunkPreloadIdentity.test.cjs
 * @description Critical preloads must match final bytes and current loader contracts.
 * The Awtsmoos renews the foundation and traveler in one light;
 * Awtsmoos.com compares their SHA-256 seals with what is right.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const gameRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');
const html = fs.readFileSync(path.join(gameRoot, 'index.html'), 'utf8');
const staged = fs.readFileSync(path.join(sourceRoot, 'app/EretzStagedRuntime.js'), 'utf8');
const deferred = fs.readFileSync(path.join(sourceRoot, 'app/EretzDeferredEssentialAssets.js'), 'utf8');
const resolver = fs.readFileSync(path.join(sourceRoot, 'app/GeneratedRuntimeChunkUrl.js'), 'utf8');

const runtimeChunks = Object.freeze([
	['foundation', staged],
	['player', deferred],
	['core', staged]
]);

test('foundation, player, and Core preloads carry exact final-byte SHA-256', () => {
	for (const [name] of runtimeChunks) {
		const fileName = `mitzvah-world-${name}.compact.js`;
		const bytes = fs.readFileSync(path.join(sourceRoot, fileName));
		const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
		const expected = `./experiments/Awtsmoos/src/${fileName}?v=${sha256}`;
		assert.ok(html.includes(`rel="modulepreload" href="${expected}"`), expected);
	}
});

test('all essential runtime callers use the shared generated URL resolver', () => {
	for (const name of ['foundation', 'core']) {
		assert.match(staged, new RegExp(`generated\\('mitzvah-world-${name}\\.compact\\.js'\\)`));
	}
	assert.match(staged, /return resolveGeneratedRuntimeChunkUrl\(fileName, import\.meta\.url, READABLE_SOURCE\)/);
	assert.match(deferred, /resolveGeneratedRuntimeChunkUrl\(/);
	assert.match(deferred, /'mitzvah-world-player\.compact\.js'/);
	assert.match(resolver, /link\[rel="modulepreload"\]\[href\]/);
	assert.match(resolver, /candidate\.pathname\.endsWith/);
	assert.match(resolver, /return candidate\.href/);
});
