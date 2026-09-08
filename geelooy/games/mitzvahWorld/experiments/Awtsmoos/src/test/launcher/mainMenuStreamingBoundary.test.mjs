// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves first control stays tiny and Simple Meadow reaches its runtime before badge, creative, renderer, and presentation graphs.
 * The Awtsmoos reveals each doorway in its measure; Awtsmoos.com keeps movement on the narrow road while optional garments remain
 * syntactically and temporally beyond the diagnostics boundary where a playable world already exists.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const GAME_ROOT_URL = new URL('../../../../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, GAME_ROOT_URL), 'utf8');

test('production page publishes generated game entry plus independent player shell', async () => {
	const html = await source('index.html');
	assert.match(html, /mitzvah-world\.production\.css/);
	assert.match(html, /player-shell\/index\.css\?compact=true/);
	assert.match(html, /mitzvah-world\.compact\.js/);
	assert.match(html, /player-shell\/index\.js\?compact=true/);
	assert.doesNotMatch(html, /modulepreload|preload/);
});

test('boot opens the authored launcher only through explicit CompactJS', async () => {
	const boot = await source('experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js');
	assert.match(boot, /MitzvahWorldLauncher\.js\?compact=true/);
	assert.match(boot, /awaitMitzvahWorldFirstPaint/);
	assert.doesNotMatch(boot, /createEretzRuntime|HudMinimizeController/);
});

test('single-player awaits runtime before local policy and leaves badge until after diagnostics', async () => {
	const loader = await source('experiments/Awtsmoos/src/launcher/MitzvahWorldModeLoaders.js');
	const runtimeImport = loader.indexOf('await import(SINGLE_PLAYER_RUNTIME_URL)');
	const policyImport = loader.indexOf('await import(SINGLE_PLAYER_OPTIONS_URL)');
	const diagnostics = loader.indexOf('const diagnostics = await runtimeModule.createEretzRuntime');
	const aftercare = loader.indexOf("startModeAftercare('singlePlayer'");
	assert.ok(runtimeImport >= 0);
	assert.ok(policyImport > runtimeImport);
	assert.ok(diagnostics > policyImport);
	assert.ok(aftercare > diagnostics);
	assert.doesNotMatch(loader.slice(runtimeImport, diagnostics), /MultiplayerStatusBadge|PostPlay/);
});

test('createEretzRuntime publishes playable before rich renderer policy and has no texture re-export', async () => {
	const runtime = await source('experiments/Awtsmoos/src/app/createEretzRuntime.js');
	const publish = runtime.indexOf('publishRuntime(core.diagnostics, environment)');
	const renderer = runtime.indexOf('startRendererAfterPlay(core.diagnostics');
	assert.ok(publish >= 0);
	assert.ok(renderer > publish);
	assert.doesNotMatch(runtime, /from '\.\/EretzRendererWorldPolicy\.js'/);
	assert.doesNotMatch(runtime, /export \{ startGameplayTextureStreaming \}/);
});

test('staged runtime opens generated foundation before generated map-ready core', async () => {
	const staged = await source('experiments/Awtsmoos/src/app/EretzStagedRuntime.js');
	const foundation = staged.indexOf('mitzvah-world-foundation.compact.js');
	const core = staged.indexOf('mitzvah-world-core.compact.js');
	assert.ok(foundation >= 0);
	assert.ok(core > foundation);
	assert.match(staged, /resolveGeneratedRuntimeChunkUrl/);
	assert.doesNotMatch(staged, /resolveResponsiveRuntimeModuleUrl|PlayableRuntimeBundleEntry/);
});

test('foundation paints WebGL before local traveler and visible valley creation', async () => {
	const foundation = await source('experiments/Awtsmoos/src/app/EretzWorldFoundation.js');
	const services = foundation.indexOf('const services = createEretzFoundationServices');
	const paint = foundation.indexOf('const webGlBootFrame = paintEretzWebGlBootFrame');
	const frameYield = foundation.indexOf('await nextLaunchFrame(environment)');
	const assets = foundation.indexOf('const loaded = await loadEretzEssentialAssets');
	const world = foundation.indexOf('const world = createBootstrapWorldFoundation');
	assert.ok(services >= 0);
	assert.ok(paint > services);
	assert.ok(frameYield > paint);
	assert.ok(assets > frameYield);
	assert.ok(world > assets);
});
