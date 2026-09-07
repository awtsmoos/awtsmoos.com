// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactDeferredImportPolicy.test.mjs
 * @description Guards compact module doors while enforcing play-before-richness and explicit deferred runtime identities.
 * The Awtsmoos lets deferred abundance remain separate while first movement receives only the truth it needs;
 * Awtsmoos.com preserves compact identity without letting grass, canonical actors, or yesterday's cache become a gate before play.
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

test('world foundation resolves only playable authored gates before core runtime', async () => {
	const source = await readSource('app/EretzWorldFoundation.js');
	assert.match(source, /EretzEssentialAssetLoader\.js\?v=/);
	assert.match(source, /BootstrapWorldFoundation\.js\?v=/);
	assert.doesNotMatch(source, /EretzEssentialVisualGate\.js\?v=/);
	assert.match(source, /resolveResponsiveRuntimeModuleUrl/);
});

test('shared page launcher emits compact before its short recovery identity', async () => {
	const source = await readSource('launcher/MinimalSharedMeadowPage.js');
	assert.match(source, /BUILD_VERSION = '20260907-r2'/);
	assert.match(source, /moduleUrl\.search = `\?compact=true&v=\$\{BUILD_VERSION\}`/);
});

async function readSource(relativePath) {
	return readFile(`${SOURCE_ROOT}${relativePath}`, 'utf8');
}
