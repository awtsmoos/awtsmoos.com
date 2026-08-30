// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactDeferredImportPolicy.test.mjs
 * @description Guards computed local ESM doors while allowing source-aware URL helpers to restore original app paths after compact relocation.
 * The Awtsmoos lets deferred abundance remain separate without forgetting where each light began;
 * Awtsmoos.com tests literal compact doors and resolver-governed doors by their real covenant, so gathered code can move while truthful module paths remain.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const EXPECTED = Object.freeze({
	'app/EretzCanonicalNpcSeed.js': [
		'FriendlyNpcProfiles.js?compact=true&v=',
		'EretzFallbackActorTemplate.js?compact=true&v='
	],
	'app/EretzDeferredEnrichmentLaunch.js': ['EretzDeferredRuntimeEnrichment.js?compact=true&v='],
	'app/EretzDistrictStreamingLaunch.js': ['BootstrapDistrictStreamer.js?compact=true&v='],
	'app/EretzOptionalWorldStreaming.js': [
		'EretzTerrainStreaming.js?compact=true&v=',
		'EretzBotanicalStreaming.js?compact=true&v='
	],
	'app/EretzRendererHydrationLaunch.js': ['RendererHydrationScheduler.js?compact=true&v='],
	'app/EretzPostPlayablePriority.js': [
		'EretzDistrictStreamingLaunch.js?compact=true&v=',
		'EretzDeferredEnrichmentLaunch.js?compact=true&v='
	],
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

test('canonical player hydration delegates compact identity to the source-aware app resolver', async () => {
	const source = await readSource('app/BootstrapCanonicalPlayerHydration.js');
	assert.match(source, /resolveDeferredAppModuleUrl/);
	assert.match(source, /MinimalMeadowPlayerHydration\.js\?v=/);
	assert.match(source, /canonicalPlayerHydratorUrl/);
	assert.doesNotMatch(source, /import\(['"]\.\/MinimalMeadowPlayerHydration\.js/);
});

test('deferred app URL helper prepends compact while preserving authored query entries', async () => {
	const { resolveDeferredAppModuleUrl } = await import('../../app/DeferredAppModuleUrl.js');
	const resolved = resolveDeferredAppModuleUrl(
		'Feature.js?v=alpha&mode=quiet',
		'https://awtsmoos.com/game/app/DeferredAppModuleUrl.js',
		'DeferredAppModuleUrl.js'
	);
	const url = new URL(resolved);
	assert.equal(url.search, '?compact=true&v=alpha&mode=quiet');
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
