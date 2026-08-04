// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves compact publication, staged WebGL, map-ready cache boundaries, and deferred realtime.
 * The Awtsmoos reveals each doorway in its measure; Awtsmoos.com keeps first control tiny while
 * movement, battle, direction, districts, creative tools, and shared worlds awaken through gates.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { GAMEPLAY_STYLESHEETS } from '../../launcher/MitzvahWorldGameplayPresentation.js';

const GAME_ROOT_URL = new URL('../../../../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, GAME_ROOT_URL), 'utf8');

test('native meadow page publishes one stylesheet and the compact entry directly', async () => {
	const html = await source('index.html');
	assert.equal((html.match(/<link\s+rel="stylesheet"/g) || []).length, 1);
	assert.equal((html.match(/<script\s+type="module"/g) || []).length, 1);
	assert.match(html, /mitzvah-world\.production\.css/);
	assert.match(html, /mitzvah-world\.compact\.js/);
	assert.doesNotMatch(html, /MitzvahWorldProductionEntry\.js/);
	assert.doesNotMatch(html, /modulepreload|preload/);
});

test('boot opens only the small launcher through a finite frame gate', async () => {
	const boot = await source(
		'experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js'
	);
	assert.match(boot, /requestAnimationFrame/);
	assert.match(boot, /setTimeout\?\.\(finish, 64\)/);
	assert.match(boot, /import\(LAUNCHER_URL\)/);
	assert.doesNotMatch(boot, /createEretzRuntime|HudMinimizeController/);
});

test('gameplay styles remain outside the HTML threshold', () => {
	assert.equal(GAMEPLAY_STYLESHEETS.length, 6);
	assert.equal(new Set(GAMEPLAY_STYLESHEETS).size, 6);
});

test('single-player loader owns the fresh map-ready runtime cache boundary', async () => {
	const loader = await source(
		'experiments/Awtsmoos/src/launcher/MitzvahWorldModeLoaders.js'
	);
	assert.match(loader, /createEretzRuntime\.js\?v=20260804-map-01/);
	assert.match(loader, /import\(SINGLE_PLAYER_RUNTIME_URL\)/);
	assert.doesNotMatch(loader, /createEretzRuntime\.js\?v=20260804-combat-01/);
});

test('runtime rebases staged startup and keeps heavy systems explicit', async () => {
	const runtime = await source(
		'experiments/Awtsmoos/src/app/createEretzRuntime.js'
	);
	assert.match(runtime, /resolveDeferredAppModuleUrl/);
	assert.match(runtime, /BootPhaseTracker\.js\?v=20260722-boot-text-01/);
	assert.match(runtime, /EretzStagedRuntime\.js\?v=20260804-map-01/);
	assert.match(runtime, /import\(TRACKER_URL\)/);
	assert.match(runtime, /import\(STAGED_RUNTIME_URL\)/);
	assert.match(runtime, /authoredTerrain:\s*'district-streaming-required'/);
	assert.match(runtime, /richRenderer:\s*'deferred'/);
	assert.doesNotMatch(runtime, /playable-runtime|PLAYABLE_BUNDLE_URL/);
});

test('staged runtime imports foundation before map-ready core assembly', async () => {
	const staged = await source(
		'experiments/Awtsmoos/src/app/EretzStagedRuntime.js'
	);
	const foundation = staged.indexOf('EretzWorldFoundation.js');
	const assembly = staged.indexOf('BootstrapCoreRuntimeAssembly.js?v=20260804-map-01');
	assert.ok(foundation >= 0);
	assert.ok(assembly > foundation);
	assert.doesNotMatch(staged, /EretzCoreRuntimeAssembly|PlayableRuntimeBundleEntry/);
});

test('foundation paints WebGL, loads control, then creates bootstrap world', async () => {
	const foundation = await source(
		'experiments/Awtsmoos/src/app/EretzWorldFoundation.js'
	);
	const paint = foundation.indexOf('paintEretzWebGlBootFrame');
	const assetImport = foundation.indexOf('EretzEssentialAssetLoader.js');
	const assetAwait = foundation.indexOf('await loadEretzEssentialAssets');
	const bootstrapImport = foundation.indexOf('BootstrapWorldFoundation.js');
	assert.ok(paint >= 0);
	assert.ok(assetImport > paint);
	assert.ok(assetAwait > assetImport);
	assert.ok(bootstrapImport > assetAwait);
	assert.doesNotMatch(foundation, /Terrain3D|EretzWorldFinalizer/);
});

test('multiplayer connection begins only after local runtime resolves', async () => {
	const bootstrap = await source(
		'experiments/Awtsmoos/src/network/MultiplayerEretzBootstrap.js'
	);
	const runtimeAwait = bootstrap.indexOf('await runtimeFactory(hosts, runtimeOptions)');
	const connectionStart = bootstrap.indexOf('diagnostics.multiplayerReady = multiplayer.start()');
	const returnStatement = bootstrap.lastIndexOf('return diagnostics;');
	assert.ok(runtimeAwait >= 0);
	assert.ok(connectionStart > runtimeAwait);
	assert.ok(returnStatement > connectionStart);
	assert.doesNotMatch(bootstrap.slice(connectionStart, returnStatement), /await multiplayer\.start/);
});
