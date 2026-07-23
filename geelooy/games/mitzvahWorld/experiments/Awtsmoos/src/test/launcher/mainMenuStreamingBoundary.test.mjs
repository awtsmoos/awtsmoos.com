// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves menu, WebGL foundation, core runtime, and enrichment are separate waves.
 * The Awtsmoos reveals each world in ordered measures; Awtsmoos.com rejects a renamed monolith
 * and tests the focused module that now owns every startup boundary.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { GAMEPLAY_STYLESHEETS } from '../../launcher/MitzvahWorldGameplayPresentation.js';

const GAME_ROOT_URL = new URL('../../../../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, GAME_ROOT_URL), 'utf8');

test('page threshold requests one stylesheet and one JavaScript entry', async () => {
	const html = await source('index.html');
	assert.equal((html.match(/<link\s+rel="stylesheet"/g) || []).length, 1);
	assert.equal((html.match(/<script\s+type="module"/g) || []).length, 1);
	assert.match(html, /mitzvah-world-menu-shell\.css/);
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

test('runtime opens the staged orchestrator and never imports the legacy bundle', async () => {
	const runtime = await source(
		'experiments/Awtsmoos/src/app/createEretzRuntime.js'
	);
	assert.match(runtime, /STAGED_RUNTIME_URL/);
	assert.match(runtime, /import\(STAGED_RUNTIME_URL\)/);
	assert.doesNotMatch(runtime, /playable-runtime|PLAYABLE_BUNDLE_URL/);
	assert.match(runtime, /EretzDeferredRuntimeEnrichment/);
});

test('staged runtime imports foundation before core assembly', async () => {
	const staged = await source(
		'experiments/Awtsmoos/src/app/EretzStagedRuntime.js'
	);
	const foundation = staged.indexOf('EretzWorldFoundation.js');
	const assembly = staged.indexOf('EretzCoreRuntimeAssembly.js');
	assert.ok(foundation >= 0);
	assert.ok(assembly > foundation);
	assert.doesNotMatch(staged, /PlayableRuntimeBundleEntry|playable-runtime/);
});

test('foundation paints WebGL, awaits assets, then delegates finalization', async () => {
	const foundation = await source(
		'experiments/Awtsmoos/src/app/EretzWorldFoundation.js'
	);
	const paint = foundation.indexOf('paintEretzWebGlBootFrame');
	const assetCall = foundation.indexOf('await loadFoundationAssets');
	const finalizer = foundation.indexOf('EretzWorldFinalizer.js');
	assert.ok(paint >= 0);
	assert.ok(assetCall > paint);
	assert.ok(finalizer > assetCall);
});

test('world finalizer builds collision cooperatively after terrain', async () => {
	const finalizer = await source(
		'experiments/Awtsmoos/src/app/EretzWorldFinalizer.js'
	);
	assert.match(finalizer, /buildWorldCollisionOctreeAsync/);
	assert.match(finalizer, /nextLaunchTask/);
	assert.doesNotMatch(finalizer, /buildWorldCollisionOctree\(/);
});

test('multiplayer connection begins after local runtime resolves', async () => {
	const bootstrap = await source(
		'experiments/Awtsmoos/src/network/MultiplayerEretzBootstrap.js'
	);
	const runtimeAwait = bootstrap.indexOf(
		'await runtimeFactory(hosts, runtimeOptions)'
	);
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
