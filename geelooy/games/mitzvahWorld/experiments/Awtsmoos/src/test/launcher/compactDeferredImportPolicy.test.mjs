// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactDeferredImportPolicy.test.mjs
 * @description Guards compact module doors while enforcing the new GLB-only human graph and authored-before-play visual gate.
 * The Awtsmoos lets deferred abundance remain separate while every human doorway stays authored and true;
 * Awtsmoos.com preserves compact identity without reopening a fallback actor or delayed generated-player route anew.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const EXPECTED = Object.freeze({
	'app/EretzCanonicalNpcSeed.js': [
		'FriendlyNpcProfiles.js?compact=true&v=20260902-glb-humans-only-01',
		'EretzActorAssetLoader.js?compact=true&v=20260902-glb-humans-only-01'
	],
	'app/EretzDeferredEnrichmentLaunch.js': ['EretzDeferredRuntimeEnrichment.js?compact=true&v='],
	'app/EretzDistrictStreamingLaunch.js': ['BootstrapDistrictStreamer.js?compact=true&v='],
	'app/EretzOptionalWorldStreaming.js': [
		'EretzTerrainStreaming.js?compact=true&v=',
		'EretzBotanicalStreaming.js?compact=true&v='
	],
	'app/EretzPostPlayableLaunchers.js': [
		'EretzDistrictStreamingLaunch.js?compact=true&v=',
		'EretzDeferredEnrichmentLaunch.js?compact=true&v='
	],
	'app/EretzRendererHydrationLaunch.js': ['RendererHydrationScheduler.js?compact=true&v='],
	'launcher/bootMitzvahWorldPage.js': ['MitzvahWorldLauncher.js?compact=true&v=']
});

test('literal variable module doors explicitly request compact server graphs', async () => {
	for (const [relativePath, markers] of Object.entries(EXPECTED)) {
		const source = await readSource(relativePath);
		for (const marker of markers) {
			assert.equal(source.includes(marker), true, `${relativePath} missing ${marker}`);
		}
	}
});

test('canonical NPC seed contains no procedural-human compact doorway', async () => {
	const source = await readSource('app/EretzCanonicalNpcSeed.js');
	assert.doesNotMatch(source, /EretzFallbackActorTemplate|createFallbackActorGltf/);
	assert.match(source, /EretzActorAssetLoader\.js\?compact=true/);
});

test('world foundation resolves authored gates through responsive compact URLs', async () => {
	const source = await readSource('app/EretzWorldFoundation.js');
	assert.match(source, /EretzEssentialAssetLoader\.js\?v=/);
	assert.match(source, /EretzEssentialVisualGate\.js\?v=/);
	assert.match(source, /resolveResponsiveRuntimeModuleUrl/);
});

test('shared page launcher builder records compact before version identity', async () => {
	const source = await readSource('launcher/MinimalSharedMeadowPage.js');
	const compactIndex = source.indexOf("searchParams.set('compact', 'true')");
	const versionIndex = source.indexOf("searchParams.set('v', BUILD_VERSION)");
	assert.ok(compactIndex >= 0);
	assert.ok(versionIndex > compactIndex);
});

async function readSource(relativePath) {
	return readFile(`${SOURCE_ROOT}${relativePath}`, 'utf8');
}
