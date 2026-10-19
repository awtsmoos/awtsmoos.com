// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStreamingBoundary.test.mjs
 * @description Proves first control stays narrow while exact critical chunks and canonical player may be prewarmed.
 * The Awtsmoos reveals the necessary vessels before the first step while richer garments wait outside the gate;
 * Awtsmoos.com may prewarm foundation, player, movement-prime core, and Chossid, never post-control abundance.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const GAME_ROOT_URL = new URL('../../../../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, GAME_ROOT_URL), 'utf8');

test('production page prewarms only hashed first-control modules and canonical player', async () => {
	const html = await source('index.html');
	assert.match(html, /mitzvah-world\.production\.css(?:\?v=[^"']+)?/);
	for (const chunk of ['foundation', 'player', 'core']) {
		assert.match(
			html,
			new RegExp(`rel="modulepreload" href="\\./experiments/Awtsmoos/src/mitzvah-world-${chunk}\\.compact\\.js\\?v=[0-9a-f]{64}"`)
		);
	}
	assert.match(html, /rel="preload" as="fetch"[^>]+chossid\.glb/);
	assert.doesNotMatch(
		html,
		/modulepreload[^>]+mitzvah-world-(post-control|presentation|world|optional)\.compact\.js/
	);
	assert.match(html, /mitzvah-world\.compact\.js\?v=[^"']+/);
});

test('page boot opens the authored launcher without embedding runtime implementation', async () => {
	const boot = await source('experiments/Awtsmoos/src/launcher/bootMitzvahWorldPage.js');
	assert.match(boot, /resolveMitzvahWorldReleaseResourceUrl/);
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

test('createEretzRuntime returns evidence without an alternate playable publisher', async () => {
	const runtime = await source('experiments/Awtsmoos/src/app/createEretzRuntime.js');
	assert.match(runtime, /installEretzPostPlayableActivation/);
	assert.doesNotMatch(runtime, /markRuntimePlayable|publishRuntime/);
	assert.doesNotMatch(runtime, /EretzVisualPromotionSequence|EretzPostPlayablePriority/);
});

test('post-control and richer activation wait behind the strict publisher', async () => {
	const publisher = await source('experiments/Awtsmoos/src/launcher/MitzvahWorldPlayablePublisher.js');
	const activation = await source('experiments/Awtsmoos/src/app/EretzPostPlayableActivation.js');
	assert.match(publisher, /diagnostics\.activatePostPlayable\?\.\(\)/);
	assert.match(activation, /mitzvah-world-post-control\.compact\.js/);
	assert.match(activation, /hydrateBootstrapPostControl/);
	assert.match(activation, /EretzVisualPromotionSequence\.js/);
	assert.match(activation, /EretzPostPlayablePriority\.js/);
});

test('staged runtime opens foundation before the generated movement-prime core', async () => {
	const staged = await source('experiments/Awtsmoos/src/app/EretzStagedRuntime.js');
	const foundation = staged.indexOf('mitzvah-world-foundation.compact.js');
	const core = staged.indexOf('mitzvah-world-core.compact.js');
	assert.ok(foundation >= 0);
	assert.ok(core > foundation);
	assert.match(staged, /assembleBootstrapEssentialPrime/);
	assert.doesNotMatch(staged, /assembleBootstrapCoreRuntime/);
});

test('foundation starts player fetch while painting WebGL and terrain before awaiting it', async () => {
	const foundation = await source('experiments/Awtsmoos/src/app/EretzWorldFoundation.js');
	const assetStart = foundation.indexOf('beginDeferredEretzEssentialAssets');
	const services = foundation.indexOf('services = createEretzFoundationServices');
	const paint = foundation.indexOf('webGlBootFrame = paintEretzWebGlBootFrame');
	const world = foundation.indexOf('const world = createBootstrapWorldFoundation');
	const frameYield = foundation.indexOf('await nextLaunchFrame(environment)');
	const assets = foundation.indexOf('const loaded = await essentialAssetsPromise');
	assert.ok(assetStart >= 0);
	assert.ok(services > assetStart);
	assert.ok(paint > services);
	assert.ok(world > paint);
	assert.ok(frameYield > world);
	assert.ok(assets > frameYield);
});
