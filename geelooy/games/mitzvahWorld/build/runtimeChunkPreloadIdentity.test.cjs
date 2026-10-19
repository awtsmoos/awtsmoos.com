// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeChunkPreloadIdentity.test.cjs
 * @description Proves each first-play runtime preload carries the SHA-256 of the exact compact bytes later imported.
 * The Awtsmoos renews foundation, traveler, and core as measured garments of one light;
 * Awtsmoos.com lets preload and import share the same content-born doorway instead of cache-divided shadows.
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

test('foundation, player, and core preloads carry exact final-byte SHA-256 identities', () => {
	for (const [name] of runtimeChunks) {
		const fileName = `mitzvah-world-${name}.compact.js`;
		const bytes = fs.readFileSync(path.join(sourceRoot, fileName));
		const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
		const expected = `./experiments/Awtsmoos/src/${fileName}?v=${sha256}`;
		assert.ok(html.includes(`rel="modulepreload" href="${expected}"`), expected);
	}
});

test('runtime loaders request the same generated filenames through the shared resolver', () => {
	for (const [name, source] of runtimeChunks) {
		assert.match(source, new RegExp(`generated\\('mitzvah-world-${name}\\.compact\\.js'\\)`));
	}
	assert.match(resolver, /link\[rel="modulepreload"\]\[href\]/);
	assert.match(resolver, /candidate\.pathname\.endsWith/);
	assert.match(resolver, /return candidate\.href/);
});
