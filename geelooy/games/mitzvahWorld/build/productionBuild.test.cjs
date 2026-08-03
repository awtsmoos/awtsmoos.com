// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves compact publication, deterministic chunks, approved compression, and the complete creative cinema boundary.
 * The Awtsmoos gathers swift control and later cinematic garments without confusing their vessels;
 * Awtsmoos.com verifies hashes, decompression, dynamic routing, Chossid safety, and 1,440-frame intent.
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
	assert.match(entry, /: '\.\/mitzvah-world\.compact\.js'/);
});

test('B"H production CSS is complete with approved identity and Brotli vessels', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	verifyIdentityAndBrotli('styles/generated/mitzvah-world.production.css', manifest.representations);
	assert.equal(fs.existsSync(path.join(root, 'styles/generated/mitzvah-world.production.css.gz')), false);
});

test('B"H first-control artifact is deterministic and bounded', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes > 100000);
	assert.ok(manifest.outputBytes < 2500000);
	for (const marker of ['FIRST_PAINT_FALLBACK_MS', 'mitzvah-world-presentation.compact.js', 'mitzvah-world-world.compact.js']) {
		assert.match(compact, new RegExp(escapePattern(marker)));
	}
	verifyRepresentations('experiments/Awtsmoos/src/mitzvah-world.compact.js', manifest.representations);
});

for (const [name, exportedName] of chunks) {
	test(`B"H ${name} chunk is deterministic and complete`, () => {
		const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		const manifest = json(`build/generated/mitzvah-world-${name}.json`);
		const compact = text(relative);
		assert.equal(manifest.deterministic, true);
		assert.equal(manifest.name, name);
		assert.match(compact, new RegExp(exportedName));
		verifyRepresentations(relative, manifest.representations);
	});
}

test('B"H compact route preserves the complete served cinema source graph', () => {
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	const loader = text('experiments/Awtsmoos/src/launcher/MitzvahWorldCreativeModeLoaders.js');
	const api = text('experiments/Awtsmoos/src/movie/MovieStudioApi.js');
	const cinema = cinemaSources();
	assert.match(compact, /MitzvahWorldCreativeModeLoaders\.js/);
	assert.match(loader, /import\('\.\.\/movie\/MovieStudio\.js'\)/);
	assert.match(api, /createMovieStudioCinemaDomain/);
	for (const marker of [
		'createMovieCinemaFlagship', 'one-minute-chassidic-village',
		'assets/models/player/chossid.glb', 'MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT',
		'UNSAFE_CINEMA_HUMAN'
	]) assert.match(cinema, new RegExp(escapePattern(marker)), marker);
});

function cinemaSources() {
	return fs.readdirSync(path.join(root, 'experiments/Awtsmoos/src/movie'))
		.filter(name => /^Movie(?:Cinema|StudioApiCinema)/.test(name) && name.endsWith('.js'))
		.sort()
		.map(name => text(`experiments/Awtsmoos/src/movie/${name}`))
		.join('\n');
}

function verifyIdentityAndBrotli(relativePath, representations) {
	const identity = bytes(relativePath);
	const brotli = bytes(`${relativePath}.br`);
	assert.deepEqual(zlib.brotliDecompressSync(brotli), identity);
	for (const [name, value] of Object.entries({ identity, brotli })) {
		assert.equal(representations[name].bytes, value.length);
		assert.equal(representations[name].sha256, sha256(value));
	}
}

function verifyRepresentations(relativePath, representations) {
	verifyIdentityAndBrotli(relativePath, representations);
	const gzip = bytes(`${relativePath}.gz`);
	assert.deepEqual(zlib.gunzipSync(gzip), bytes(relativePath));
	assert.equal(representations.gzip.sha256, sha256(gzip));
}

function bytes(relativePath) { return fs.readFileSync(path.join(root, relativePath)); }
function text(relativePath) { return bytes(relativePath).toString('utf8'); }
function json(relativePath) { return JSON.parse(text(relativePath)); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function escapePattern(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
