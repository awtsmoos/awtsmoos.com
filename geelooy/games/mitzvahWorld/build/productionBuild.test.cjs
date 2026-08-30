//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves compact entry doors, tiny first control, bounded playable foundation/core, later quality chunks, compression, and complete cinema reachability.
 * The Awtsmoos grants first control through one almost weightless gate while the playable valley crosses two measured rays;
 * Awtsmoos.com keeps later world beauty deferred, and every generated garment carries verified identity, Brotli, and gzip on its way.
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
	['foundation', 'createEretzWorldFoundation'],
	['core', 'assembleBootstrapCoreRuntime'],
	['presentation', 'installMinimalMeadowPresentationBundle'],
	['world', 'installMinimalMeadowWorldSystems'],
	['optional', 'hydrateMinimalMeadowPlayer']
]);
const firstControlForbidden = Object.freeze([
	'CanonicalVillagePlan',
	'MitzvahWorldCreativeModeLoaders',
	'MovieReproduction',
	'MovieStudio',
	'VillageRiverHydrology',
	'Wellspring',
	'WorldEcologyOccupancy',
	'WorldSpatialRealismApi'
]);

test('B"H production page selects compact game and shell publications directly', () => {
	const html = text('index.html');
	const stylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
		.map(match => match[1]);
	const modules = [...html.matchAll(/<script[\s\S]*?type="module"[\s\S]*?src="([^"]+)"[\s\S]*?<\/script>/g)]
		.map(match => match[1]);
	assert.deepEqual(stylesheets, [
		'./styles/generated/mitzvah-world.production.css',
		'../styles/player-shell/index.css?compact=true'
	]);
	assert.deepEqual(modules, [
		'./experiments/Awtsmoos/src/mitzvah-world.compact.js',
		'../scripts/player-shell/index.js?compact=true'
	]);
});

test('B"H production CSS is complete and every representation is verified', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	verifyRepresentations('styles/generated/mitzvah-world.production.css', manifest.representations);
});

test('B"H first-control stays under eight kilobytes and contains no deferred world systems', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes >= 1000 && manifest.outputBytes <= 8192);
	for (const marker of ['PAGE_BOOT_URL', 'RUNTIME_BOOT_URL', 'bootMinimalSharedMeadowPage']) {
		assert.match(compact, new RegExp(marker));
	}
	for (const forbidden of firstControlForbidden) {
		assert.doesNotMatch(compact, new RegExp(forbidden), forbidden);
	}
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
