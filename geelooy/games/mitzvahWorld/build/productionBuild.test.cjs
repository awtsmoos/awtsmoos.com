// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves the split production publication is deterministic, compressed, and complete.
 * The Awtsmoos grants first control through a small vessel while later worlds keep measured light;
 * Awtsmoos.com verifies every hash, handoff, cinema source, and compressed byte in sight.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	cinemaSources,
	json,
	text,
	verifyRepresentations
} = require('./ProductionBuildProof.cjs');
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
	assert.match(entry, /mitzvah-world\.compact\.js/);
});

test('B"H production CSS is complete and every representation is verified', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	verifyRepresentations('styles/generated/mitzvah-world.production.css', manifest.representations);
});

test('B"H first-control artifact is deterministic, tiny, and hands off canonically', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes >= 1000 && manifest.outputBytes <= 20000);
	for (const marker of ['PAGE_BOOT_URL', 'RUNTIME_BOOT_URL', 'bootCanonicalMitzvahWorldPage']) {
		assert.match(compact, new RegExp(marker));
	}
	assert.doesNotMatch(compact, /MitzvahWorldCreativeModeLoaders/);
	verifyRepresentations('experiments/Awtsmoos/src/mitzvah-world.compact.js', manifest.representations);
});

for (const [name, exportedName] of chunks) {
	test(`B"H ${name} chunk is deterministic and complete`, () => {
		const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		const manifest = json(`build/generated/mitzvah-world-${name}.json`);
		assert.equal(manifest.deterministic, true);
		assert.equal(manifest.name, name);
		assert.match(text(relative), new RegExp(exportedName));
		verifyRepresentations(relative, manifest.representations);
	});
}

test('B"H deferred creative mode preserves the complete served cinema graph', () => {
	const loader = text('experiments/Awtsmoos/src/launcher/MitzvahWorldCreativeModeLoaders.js');
	const api = text('experiments/Awtsmoos/src/movie/MovieStudioApi.js');
	const cinema = cinemaSources();
	assert.match(loader, /import\('\.\.\/movie\/MovieStudio\.js'\)/);
	assert.match(api, /createMovieStudioCinemaDomain/);
	for (const marker of [
		'createMovieCinemaFlagship',
		'one-minute-chassidic-village',
		'assets/models/player/chossid.glb',
		'MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT',
		'UNSAFE_CINEMA_HUMAN'
	]) {
		assert.match(cinema, new RegExp(marker), marker);
	}
});
