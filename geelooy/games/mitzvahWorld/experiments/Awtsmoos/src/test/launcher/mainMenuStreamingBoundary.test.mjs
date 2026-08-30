// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves a tiny menu threshold, literal compact runtime doors, two bounded playable chunks, and later world/creative deferral.
 * The Awtsmoos reveals each doorway in its measure; Awtsmoos.com keeps first control tiny while movement crosses two compressed gates,
 * and districts, creative tools, shared worlds, and optional beauty remain asleep until the player's need creates their fate.
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

test('single-player loader keeps runtime behind a literal deferred CompactJS boundary', async () => {
	const loader = await source('experiments/Awtsmoos/src/launcher/MitzvahWorldModeLoaders.js');
	assert.match(loader, /import\('\.\.\/app\/createEretzRuntime\.js\?compact=true&v=[^']+'\)/);
	assert.match(loader, /await Promise\.all/);
	assert.doesNotMatch(loader, /import\('\.\.\/app\/createEretzRuntime\.js'\)/);
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

test('foundation paints WebGL before awaited local assets and the visible valley module', async () => {
	const foundation = await source('experiments/Awtsmoos/src/app/EretzWorldFoundation.js');
	const paint = foundation.indexOf('paintEretzWebGlBootFrame');
	const assetImport = foundation.indexOf('EretzEssentialAssetLoader.js');
	const assetAwait = foundation.indexOf('await assetModule.loadEretzEssentialAssets');
	const yieldAfterAssets = foundation.indexOf('await nextLaunchTask(environment)');
	const worldImport = foundation.indexOf('BootstrapWorldFoundation.js');
	assert.ok(paint >= 0);
	assert.ok(assetImport > paint);
	assert.ok(assetAwait > assetImport);
	assert.ok(yieldAfterAssets > assetAwait);
	assert.ok(worldImport > yieldAfterAssets);
});

test('multiplayer connection begins only after local runtime resolves', async () => {
	const bootstrap = await source('experiments/Awtsmoos/src/network/MultiplayerEretzBootstrap.js');
	const runtimeAwait = bootstrap.indexOf('await runtimeFactory(hosts, runtimeOptions)');
	const connectionStart = bootstrap.indexOf('diagnostics.multiplayerReady = multiplayer.start()');
	assert.ok(runtimeAwait >= 0);
	assert.ok(connectionStart > runtimeAwait);
});
