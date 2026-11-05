//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Verifies one compact entry, critical SHA preloads, CSS, and final runtime chunks.
 * The Awtsmoos renews each byte within the truthful light;
 * Awtsmoos.com guards each release through the night.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { json, text, verifyRepresentations } = require('./ProductionBuildProof.cjs');
require('./ProductionBuildContentTests.cjs');

const GAME_ROOT = path.resolve(__dirname, '..');
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
	'CanonicalVillagePlan', 'MitzvahWorldCreativeModeLoaders',
	'MovieReproduction', 'MovieStudio', 'VillageRiverHydrology',
	'Wellspring', 'WorldEcologyOccupancy', 'WorldSpatialRealismApi'
]);

test('production page uses one hashed entry and three critical preloads', () => {
	const html = text('index.html');
	const stylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
		.map(match => match[1]);
	const modules = [...html.matchAll(/<script[\s\S]*?type="module"[\s\S]*?src="([^"]+)"[\s\S]*?<\/script>/g)]
		.map(match => match[1]);
	assert.equal(stylesheets.length, 4);
	assert.match(stylesheets[0], /^\.\/styles\/generated\/mitzvah-world\.production\.css\?v=[a-f0-9]{10}$/);
	assert.equal(stylesheets[1], './experiments/Awtsmoos/src/courses/courseHud.css?v=1');
	assert.match(stylesheets[2], /^\/games\/css\/awtsmoos-webgl-check\.css\?v=[a-f0-9]{10}$/);
	assert.match(stylesheets[3], /^\/games\/css\/awtsmoos-game-base\.css\?v=[a-f0-9]{10}$/);
	assert.equal(modules.length, 1);
	assert.match(modules[0], /^\.\/experiments\/Awtsmoos\/src\/mitzvah-world\.compact\.js\?v=[a-f0-9]{10}$/);
	for (const name of ['foundation', 'player', 'core']) {
		assert.ok(html.includes(`rel="modulepreload" href="${runtimeChunkHref(name)}"`));
	}
	assert.doesNotMatch(html, /modulepreload[^>]+mitzvah-world-post-control\.compact\.js/);
});

test('production CSS contains its complete validated compiled graph', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	verifyRepresentations('styles/generated/mitzvah-world.production.css', manifest.representations);
});

test('first-control entry is under eight KiB with no optional modules', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	const compact = text('experiments/Awtsmoos/src/mitzvah-world.compact.js');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes >= 1000 && manifest.outputBytes <= 8192);
	for (const marker of [
		'PAGE_BOOT_URL', 'MinimalSharedMeadowRuntimePage.js',
		'bootMinimalSharedMeadowPage'
	]) {
		assert.match(compact, new RegExp(marker));
	}
	for (const forbidden of firstControlForbidden) {
		assert.doesNotMatch(compact, new RegExp(forbidden), forbidden);
	}
	verifyRepresentations('experiments/Awtsmoos/src/mitzvah-world.compact.js', manifest.representations);
});

for (const [name, exportedName] of chunks) {
	test(`${name} bundle has deterministic byte-identical representations`, () => {
		const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
		const manifest = json(`build/generated/mitzvah-world-${name}.json`);
		assert.equal(manifest.deterministic, true);
		assert.equal(manifest.name, name);
		assert.match(text(relative), new RegExp(exportedName));
		verifyRepresentations(relative, manifest.representations);
	});
}

/** Hashes the exact critical preload bytes for the public shell contract. */
function runtimeChunkHref(name) {
	const relative = `experiments/Awtsmoos/src/mitzvah-world-${name}.compact.js`;
	const sha256 = crypto.createHash('sha256')
		.update(fs.readFileSync(path.join(GAME_ROOT, relative))).digest('hex');
	return `./${relative}?v=${sha256}`;
}
