// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves menu, visible WebGL foundation, bootstrap core, and realtime stay separate.
 * The Awtsmoos reveals each doorway in an appointed measure; Awtsmoos.com rejects both the old
 * playable bundle and any automatic authored-world enrichment before responsive control exists.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { GAMEPLAY_STYLESHEETS } from '../../launcher/MitzvahWorldGameplayPresentation.js';

const GAME_ROOT_URL = new URL('../../../../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, GAME_ROOT_URL), 'utf8');

test('native meadow page requests split styles and two explicit entries', async () => {
	const html = await source('index.html');
	assert.equal((html.match(/<link\s+rel="stylesheet"/g) || []).length, 15);
	assert.equal((html.match(/<script\s+type="module"/g) || []).length, 2);
	assert.match(html, /mitzvah-world-menu-shell\.css/);
	assert.match(html, /MinimalSharedMeadowPage\.js/);
	assert.match(html, /MinimalMeadowMobileIntegration\.js/);
	assert.doesNotMatch(html, /modulepreload|preload/);
});

test('boot opens only the small launcher through a finite frame gate', async () => {
	const boot = await source(
		'experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js'
	);
	assert.match(boot, /requestAnimationFrame/);
	assert.match(boot, /setTimeout\?\.\(finish, 48\)/);
	assert.match(boot, /import\(LAUNCHER_URL\)/);
	assert.doesNotMatch(boot, /createEretzRuntime|HudMinimizeController/);
});

test('gameplay styles remain outside the HTML threshold', () => {
	assert.equal(GAMEPLAY_STYLESHEETS.length, 6);
	assert.equal(new Set(GAMEPLAY_STYLESHEETS).size, 6);
});

test('runtime opens staged startup and keeps heavy systems explicitly deferred', async () => {
	const runtime = await source(
		'experiments/Awtsmoos/src/app/createEretzRuntime.js'
	);
	assert.match(runtime, /STAGED_RUNTIME_URL/);
	assert.match(runtime, /import\(STAGED_RUNTIME_URL\)/);
	assert.match(runtime, /deferredSystems/);
	assert.match(runtime, /authoredTerrain:\s*'district-streaming-required'/);
	assert.match(runtime, /richRenderer:\s*'deferred'/);
	assert.doesNotMatch(runtime, /playable-runtime|PLAYABLE_BUNDLE_URL/);
	assert.doesNotMatch(runtime, /EretzDeferredRuntimeEnrichment|scheduleRendererHydration/);
});

test('staged runtime imports foundation before bootstrap core assembly', async () => {
	const staged = await source(
		'experiments/Awtsmoos/src/app/EretzStagedRuntime.js'
	);
	const foundation = staged.indexOf('EretzWorldFoundation.js');
	const assembly = staged.indexOf('BootstrapCoreRuntimeAssembly.js');
	assert.ok(foundation >= 0);
	assert.ok(assembly > foundation);
	assert.doesNotMatch(staged, /EretzCoreRuntimeAssembly|PlayableRuntimeBundleEntry/);
});

test('foundation paints WebGL, loads essential control, then creates bootstrap world', async () => {
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
	assert.doesNotMatch(foundation, /Terrain3D|EretzWorldFinalizer|EretzWorldModuleLoader/);
});

test('bootstrap world contains visible valley without authored terrain imports', async () => {
	const terrain = await source(
		'experiments/Awtsmoos/src/app/BootstrapTerrainPackage.js'
	);
	const renderer = await source(
		'experiments/Awtsmoos/src/app/ProgressiveWebGLRenderer.js'
	);
	assert.match(terrain, /createBootstrapVisibleWorld/);
	assert.match(renderer, /BootstrapColorRenderer/);
	assert.doesNotMatch(`${terrain}${renderer}`, /from .*Terrain3D|from .*tiny-webgl-renderer/);
});

test('multiplayer connection begins after local runtime resolves', async () => {
	const bootstrap = await source(
		'experiments/Awtsmoos/src/network/MultiplayerEretzBootstrap.js'
	);
	const runtimeAwait = bootstrap.indexOf('await runtimeFactory(hosts, runtimeOptions)');
	const connectionStart = bootstrap.indexOf(
		'diagnostics.multiplayerReady = multiplayer.start()'
	);
	const returnStatement = bootstrap.lastIndexOf('return diagnostics;');
	assert.ok(runtimeAwait >= 0);
	assert.ok(connectionStart > runtimeAwait);
	assert.ok(returnStatement > connectionStart);
	assert.doesNotMatch(
		bootstrap.slice(connectionStart, returnStatement),
		/await multiplayer\.start/
	);
});
