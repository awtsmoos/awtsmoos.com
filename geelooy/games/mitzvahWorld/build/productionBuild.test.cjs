// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves content-hashed first control, deferred post-control hydration, release-owned assets, and complete deferred reachability.
 * The Awtsmoos gives Awtsmoos.com one truthful road from first step to later abundance;
 * the critical core must move the Chossid, while richer garments wait in their own generated vessel.
 */

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { cinemaSources, json, text, verifyRepresentations } = require('./ProductionBuildProof.cjs');

const RELEASE_VERSION = '20260928-playable-meadow-01';
const GAME_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(GAME_ROOT, '../../..');
const ESSENTIAL_ASSETS = Object.freeze([
	'build/generated/assets/canonical-chossid.glb',
	'build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb',
	'build/generated/assets/essential-grass.jpg'
]);
const chunks = Object.freeze([
	['foundation', 'createEretzWorldFoundation'],
	['player', 'loadEretzEssentialAssets'],
	['core', 'assembleBootstrapEssentialPrime'],
	['post-control', 'hydrateBootstrapPostControl'],
	['presentation', 'installMinimalMeadowPresentationBundle'],
	['world', 'installMinimalMeadowWorldSystems'],
	['optional', 'hydrateMinimalMeadowPlayer']
]);
const firstControlForbidden = Object.freeze([
	'CanonicalVillagePlan', 'MitzvahWorldCreativeModeLoaders', 'MovieReproduction', 'MovieStudio',
	'VillageRiverHydrology', 'Wellspring', 'WorldEcologyOccupancy', 'WorldSpatialRealismApi'
]);

test('production page selects compact game and only three content-hashed critical preloads', () => {
	const html = text('index.html');
	const stylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(match => match[1]);
	const modules = [...html.matchAll(/<script[\s\S]*?type="module"[\s\S]*?src="([^"]+)"[\s\S]*?<\/script>/g)].map(match => match[1]);
	assert.deepEqual(stylesheets, ['./styles/generated/mitzvah-world.production.css', '../styles/player-shell/index.css?compact=true']);
	assert.deepEqual(modules, [`./experiments/Awtsmoos/src/mitzvah-world.compact.js?v=${RELEASE_VERSION}`, '../scripts/player-shell/index.js?compact=true']);
	for (const name of ['foundation', 'player', 'core']) {
		assert.ok(html.includes(`rel="modulepreload" href="${runtimeChunkHref(name)}"`));
	}
	assert.doesNotMatch(html, /modulepreload[^>]+mitzvah-world-post-control\.compact\.js/);
});

test('production CSS is complete and every representation is verified', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	verifyRepresentations('styles/generated/mitzvah-world.production.css', manifest.representations);
});

test('release-owned first-play assets exist and are Git tracked', () => {
	for (const relative of ESSENTIAL_ASSETS) {
		const absolute = path.join(GAME_ROOT, relative);
		assert.ok(fs.statSync(absolute).size > 0, `${relative} must exist`);
		const repoRelative = path.relative(REPO_ROOT, absolute).replaceAll('\\', '/');
		assert.doesNotThrow(
			() => childProcess.execFileSync('git', ['-C', REPO_ROOT, 'ls-files', '--error-unmatch', repoRelative], { stdio: 'ignore' }),
			`${relative} must travel in Git releases`
		);
	}
});

test('first-control stays under eight kilobytes and contains no deferred world systems', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes >= 1000 && manifest.outputBytes <= 8192);
	for (const marker of ['PAGE_BOOT_URL', 'MinimalSharedMeadowRuntimePage.js', 'bootMinimalSharedMeadowPage']) {
		assert.match(compact, new RegExp(marker));
	}
	for (const forbidden of firstControlForbidden) assert.doesNotMatch(compact, new RegExp(forbidden), forbidden);
	verifyRepresentations('experiments/Awtsmoos/src/mitzvah-world.compact.js', manifest.representations);
});

for (const [name, exportedName] of chunks) {
	test(`${name} chunk is deterministic and complete`, () => {
		const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		const manifest = json(`build/generated/mitzvah-world-${name}.json`);
		assert.equal(manifest.deterministic, true);
		assert.equal(manifest.name, name);
		assert.match(text(relative), new RegExp(exportedName));
		verifyRepresentations(relative, manifest.representations);
	});
}

test('deferred creative mode preserves the complete served cinema graph', () => {
	const loader = text('experiments/Awtsmoos/src/launcher/MitzvahWorldCreativeModeLoaders.js');
	const api = text('experiments/Awtsmoos/src/movie/MovieStudioApi.js');
	const cinema = cinemaSources();
	assert.match(loader, /import\('\.\.\/movie\/MovieStudio\.js'\)/);
	assert.match(api, /createMovieStudioCinemaDomain/);
	for (const marker of ['createMovieCinemaFlagship', 'one-minute-chassidic-village', 'assets/models/player/chossid.glb', 'MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT', 'UNSAFE_CINEMA_HUMAN']) {
		assert.match(cinema, new RegExp(marker), marker);
	}
});

function runtimeChunkHref(name) {
	const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
	const bytes = fs.readFileSync(path.join(GAME_ROOT, relative));
	const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
	return `./${relative}?v=${sha256}`;
}
