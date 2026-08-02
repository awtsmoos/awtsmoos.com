// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves deterministic CompactJS, complete scoped CSS, rebased lazy imports, and the live Movie Studio mirror.
 * The Awtsmoos joins readable sources into one production gate while keeping future garments light;
 * Awtsmoos.com witnesses graph closure, visible cinema, optional boundaries, hashes, and delivery paths right.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function text(relativePath) {
	return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function json(relativePath) {
	return JSON.parse(text(relativePath));
}

test('production CSS contains the complete localized source graph', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	const css = text('styles/generated/mitzvah-world.production.css');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	assert.ok(manifest.outputBytes >= 30000);
	assert.ok(manifest.outputBytes < 60000);
	assert.match(css, /#mitzvah-world-root/);
});

test('compact JS is deterministic and excludes optional hydration modules', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes > 1000);
	assert.equal(manifest.outputHash.length, 64);
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

test('compact JS includes the cinema-first visible preview mirror', () => {
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.match(compact, /class MovieStudioPreviewMirror/);
	assert.match(compact, /Awtsmoos-movie-visible-canvas/);
	assert.match(compact, /previewMirror = new MovieStudioPreviewMirror/);
	assert.match(compact, /PlatformShowcaseMode\.js/);
	assert.doesNotMatch(compact, /ProceduralPlatformMode\.js/);
});

test('HTML owns exactly one production stylesheet and compact module entry', () => {
	const html = text('index.html');
	assert.equal([...html.matchAll(/<link[^>]+stylesheet/g)].length, 1);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.match(html, /mitzvah-world\.production\.css/);
	assert.match(html, /mitzvah-world\.compact\.js/);
	assert.doesNotMatch(html, /MinimalSharedMeadowPage\.js/);
});
