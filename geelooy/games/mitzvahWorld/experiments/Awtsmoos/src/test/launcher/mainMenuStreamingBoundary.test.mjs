// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves menu, playable bundle, and enrichment remain separate request waves.
 */

import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { GAMEPLAY_STYLESHEETS } from '../../launcher/MitzvahWorldGameplayPresentation.js';

const GAME_ROOT_URL = new URL('../../../../../', import.meta.url);
const GAME_ROOT = fileURLToPath(GAME_ROOT_URL);
const source = relativePath => readFile(new URL(relativePath, GAME_ROOT_URL), 'utf8');

test('page threshold requests one stylesheet and one JavaScript entry', async () => {
	const html = await source('index.html');
	assert.equal((html.match(/<link\s+rel="stylesheet"/g) || []).length, 1);
	assert.equal((html.match(/<script\s+type="module"/g) || []).length, 1);
	assert.match(html, /mitzvah-world-menu-shell\.css/);
	assert.doesNotMatch(html, /modulepreload|preload/);
});

test('boot dynamically opens only the lightweight launcher after paint', async () => {
	const boot = await source('experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js');
	assert.match(boot, /requestAnimationFrame/);
	assert.match(boot, /import\(LAUNCHER_URL\)/);
	assert.doesNotMatch(boot, /createEretzRuntime|HudMinimizeController/);
});

test('gameplay styles remain outside the HTML threshold', () => {
	assert.equal(GAMEPLAY_STYLESHEETS.length, 6);
	assert.equal(new Set(GAMEPLAY_STYLESHEETS).size, 6);
});

test('runtime opens one generated playable bundle before deferred enrichment', async () => {
	const runtime = await source('experiments/Awtsmoos/src/app/createEretzRuntime.js');
	assert.match(runtime, /PLAYABLE_BUNDLE_URL/);
	assert.match(runtime, /import\(PLAYABLE_BUNDLE_URL\)/);
	assert.match(runtime, /import\(\s*'\.\/EretzDeferredRuntimeEnrichment\.js/);
	assert.doesNotMatch(runtime, /EretzWorldFoundation/);
	assert.doesNotMatch(runtime, /EretzCoreRuntimeAssembly/);
});

test('generated playable bundle exists and exports its runtime doorway', async () => {
	const relative = 'experiments/Awtsmoos/dist/playable-runtime/playable-runtime.js';
	const bundle = await source(relative);
	const details = await stat(new URL(relative, GAME_ROOT_URL));
	assert.ok(details.size > 1000);
	assert.match(bundle, /createPlayableEretzRuntime/);
});

test('multiplayer connection begins after playable runtime resolves', async () => {
	const multiplayer = await source('experiments/Awtsmoos/src/network/MultiplayerEretzRuntime.js');
	const runtimeAwait = multiplayer.indexOf('await runtimeFactory(hosts, runtimeOptions)');
	const connectionStart = multiplayer.indexOf('diagnostics.multiplayerReady = multiplayer.start()');
	const returnStatement = multiplayer.lastIndexOf('return diagnostics;');
	assert.ok(runtimeAwait >= 0);
	assert.ok(connectionStart > runtimeAwait);
	assert.ok(returnStatement > connectionStart);
	assert.doesNotMatch(multiplayer.slice(connectionStart, returnStatement), /await multiplayer\.start/);
});
