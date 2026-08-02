// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves deterministic compressed first-control and three complete quality-phase chunks.
 * The Awtsmoos gathers each required garment into one swift vessel while creative doors remain living;
 * Awtsmoos.com verifies executable surfaces, decompression, hashes, boundaries, and HTML entry truth.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const chunkContracts = Object.freeze([
	['presentation', 'installMinimalMeadowPresentationBundle'],
	['world', 'installMinimalMeadowWorldSystems'],
	['optional', 'hydrateMinimalMeadowPlayer']
]);

test('production CSS contains the complete localized source graph', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	const css = bytes('styles/generated/mitzvah-world.production.css');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	assert.match(css.toString('utf8'), /#mitzvah-world-root/);
	verifyRepresentations(
		'styles/generated/mitzvah-world.production.css',
		manifest.representations
	);
});

test('first-control artifact is deterministic, compressed, and folds critical boot', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes > 100000);
	assert.ok(manifest.outputBytes < 2000000);
	for (const symbol of [
		'createEretzStagedRuntime',
		'scheduleMinimalMeadowFeatures',
		'installMinimalMeadowFeatures',
		'full-quality-default'
	]) assert.match(compact, new RegExp(escapePattern(symbol)));
	assert.doesNotMatch(compact, /function createMovieStudio/);
	verifyRepresentations(
		'experiments/Awtsmoos/src/mitzvah-world.compact.js',
		manifest.representations
	);
});

for (const [name, exportedName] of chunkContracts) {
	test(`${name} chunk is deterministic, compressed, and complete`, () => {
		const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		const manifest = json(`build/generated/mitzvah-world-${name}.json`);
		const compact = text(relative);
		assert.equal(manifest.deterministic, true);
		assert.equal(manifest.name, name);
		assert.ok(manifest.moduleCount >= 1);
		assert.ok(manifest.outputBytes > 1000);
		assert.match(compact, new RegExp(exportedName));
		verifyRepresentations(relative, manifest.representations);
	});
}

test('creative tools remain outside all first-play artifacts', () => {
	for (const file of generatedJavaScriptFiles()) {
		const compact = text(file);
		assert.doesNotMatch(compact, /function createMovieStudio/);
		assert.doesNotMatch(compact, /runMaterialDiagnosticMode/);
	}
});

test('HTML owns exactly one production stylesheet and first-control entry', () => {
	const html = text('index.html');
	assert.equal([...html.matchAll(/<link[^>]+stylesheet/g)].length, 1);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.match(html, /mitzvah-world\.production\.css/);
	assert.match(html, /mitzvah-world\.compact\.js/);
});

function generatedJavaScriptFiles() {
	return [
		'experiments/Awtsmoos/src/mitzvah-world.compact.js',
		...chunkContracts.map(([name]) => {
			return `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		})
	];
}

function verifyRepresentations(relativePath, representations) {
	const identity = bytes(relativePath);
	const brotli = bytes(`${relativePath}.br`);
	const gzip = bytes(`${relativePath}.gz`);
	assert.deepEqual(zlib.brotliDecompressSync(brotli), identity);
	assert.deepEqual(zlib.gunzipSync(gzip), identity);
	assert.ok(brotli.length < identity.length * 0.5);
	assert.ok(gzip.length < identity.length * 0.6);
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
