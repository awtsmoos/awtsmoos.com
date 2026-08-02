// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves deterministic compact JS/CSS, compressed identities, boundaries, and entry ownership.
 * The Awtsmoos joins readable sources into one complete production gate carried efficiently;
 * Awtsmoos.com witnesses graph closure, bytes, hashes, decompression, and delivery paths exactly.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');

test('production CSS contains the complete localized source graph', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	const css = bytes('styles/generated/mitzvah-world.production.css');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	assert.ok(css.length >= 30000 && css.length < 60000);
	assert.match(css.toString('utf8'), /#mitzvah-world-root/);
	verifyRepresentations(
		'styles/generated/mitzvah-world.production.css',
		manifest.representations
	);
});

test('compact JS is deterministic, compressed, and excludes optional hydration modules', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes > 1000);
	assert.equal(manifest.outputHash.length, 64);
	verifyRepresentations(
		'experiments/Awtsmoos/src/mitzvah-world.compact.js',
		manifest.representations
	);
});

test('compact JS rebases boot-critical imports without bundling them', () => {
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.match(compact, /resolveDeferredAppModuleUrl/);
	assert.match(compact, /new URL\('\.\/app\/', sourceUrl\)/);
	assert.match(compact, /BootPhaseTracker\.js\?v=20260722-boot-text-01/);
	assert.match(compact, /EretzStagedRuntime\.js\?v=20260723-stream-21/);
	assert.match(compact, /MinimalMeadowFeatureScheduler\.js/);
	assert.match(compact, /import\(TRACKER_URL\)/);
	assert.match(compact, /import\(STAGED_RUNTIME_URL\)/);
	assert.match(compact, /import\(FEATURE_SCHEDULER_URL\)/);
	assert.doesNotMatch(compact, /@file BootPhaseTracker\.js/);
	assert.doesNotMatch(compact, /@file EretzStagedRuntime\.js/);
	assert.doesNotMatch(compact, /@file MinimalMeadowFeatureScheduler\.js/);
});

test('HTML owns exactly one production stylesheet and compact module entry', () => {
	const html = text('index.html');
	assert.equal([...html.matchAll(/<link[^>]+stylesheet/g)].length, 1);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.match(html, /mitzvah-world\.production\.css/);
	assert.match(html, /mitzvah-world\.compact\.js/);
	assert.doesNotMatch(html, /MinimalSharedMeadowPage\.js/);
});

function verifyRepresentations(relativePath, representations) {
	const identity = bytes(relativePath);
	const brotli = bytes(`${relativePath}.br`);
	const gzip = bytes(`${relativePath}.gz`);
	assert.deepEqual(zlib.brotliDecompressSync(brotli), identity);
	assert.deepEqual(zlib.gunzipSync(gzip), identity);
	assert.ok(brotli.length < identity.length * 0.45);
	assert.ok(gzip.length < identity.length * 0.55);
	assert.equal(representations.identity.bytes, identity.length);
	assert.equal(representations.brotli.bytes, brotli.length);
	assert.equal(representations.gzip.bytes, gzip.length);
	assert.equal(representations.identity.sha256, sha256(identity));
	assert.equal(representations.brotli.sha256, sha256(brotli));
	assert.equal(representations.gzip.sha256, sha256(gzip));
}

function bytes(relativePath) {
	return fs.readFileSync(path.join(root, relativePath));
}

function text(relativePath) {
	return bytes(relativePath).toString('utf8');
}

function json(relativePath) {
	return JSON.parse(text(relativePath));
}

function sha256(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}
