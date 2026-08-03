// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves one compact-default page plus deterministic compressed presentation, world, and optional chunks.
 * The Awtsmoos gathers first control into one public doorway while every complete later garment stays whole;
 * Awtsmoos.com verifies entry truth, exact decompression, hashes, chunk surfaces, and creative separation.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const chunks = Object.freeze([
	['presentation', 'installMinimalMeadowPresentationBundle'],
	['world', 'installMinimalMeadowWorldSystems'],
	['optional', 'hydrateMinimalMeadowPlayer']
]);

test('B"H production page selects compact publication by default', () => {
	const html = text('index.html');
	const entry = text('experiments/Awtsmoos/src/MitzvahWorldProductionEntry.js');
	assert.equal([...html.matchAll(/<link[^>]+stylesheet/g)].length, 1);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.match(html, /MitzvahWorldProductionEntry\.js/);
	assert.match(entry, /parameters\.get\('readable'\) === '1'/);
	assert.match(entry, /\? '\.\/MinimalMeadowCompactBootstrap\.js'/);
	assert.match(entry, /: '\.\/mitzvah-world\.compact\.js'/);
});

test('B"H production CSS is complete and exactly compressed', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	verifyRepresentations(
		'styles/generated/mitzvah-world.production.css',
		manifest.representations
	);
});

test('B"H first-control artifact is deterministic and bounded', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes > 100000);
	assert.ok(manifest.outputBytes < 2500000);
	for (const marker of [
		'FIRST_PAINT_FALLBACK_MS',
		'mitzvah-world-presentation.compact.js',
		'mitzvah-world-world.compact.js',
		'mitzvah-world-optional.compact.js'
	]) assert.match(compact, new RegExp(escapePattern(marker)));
	assert.doesNotMatch(compact, /MovieRenderRuntime/);
	verifyRepresentations(
		'experiments/Awtsmoos/src/mitzvah-world.compact.js',
		manifest.representations
	);
});

for (const [name, exportedName] of chunks) {
	test(`B"H ${name} chunk is deterministic and complete`, () => {
		const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		const manifest = json(`build/generated/mitzvah-world-${name}.json`);
		const compact = text(relative);
		assert.equal(manifest.deterministic, true);
		assert.equal(manifest.name, name);
		assert.ok(manifest.outputBytes > 1000);
		assert.match(compact, new RegExp(exportedName));
		assert.doesNotMatch(compact, /MovieRenderRuntime/);
		verifyRepresentations(relative, manifest.representations);
	});
}

function verifyRepresentations(relativePath, representations) {
	const identity = bytes(relativePath);
	const brotli = bytes(`${relativePath}.br`);
	const gzip = bytes(`${relativePath}.gz`);
	assert.deepEqual(zlib.brotliDecompressSync(brotli), identity);
	assert.deepEqual(zlib.gunzipSync(gzip), identity);
	for (const [name, value] of Object.entries({ identity, brotli, gzip })) {
		assert.equal(representations[name].bytes, value.length);
		assert.equal(representations[name].sha256, sha256(value));
	}
}

function bytes(relativePath) { return fs.readFileSync(path.join(root, relativePath)); }
function text(relativePath) { return bytes(relativePath).toString('utf8'); }
function json(relativePath) { return JSON.parse(text(relativePath)); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function escapePattern(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
