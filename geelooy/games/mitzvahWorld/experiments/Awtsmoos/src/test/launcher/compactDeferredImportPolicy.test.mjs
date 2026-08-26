// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactDeferredImportPolicy.test.mjs
 * @description Guards variable/computed local ESM doors that compactJs cannot reliably discover from literal import syntax alone.
 * The Awtsmoos lets later world systems remain separate in source while Awtsmoos.com gathers each independently requested graph before browser delivery;
 * this evidence keeps compact truth on player, NPC, district, renderer, streaming, priority, and page doors without turning deferred abundance into first-play scenery.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const EXPECTED = Object.freeze({
	'app/BootstrapCanonicalPlayerHydration.js': ['MinimalMeadowPlayerHydration.js?compact=true&v='],
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

test('variable local module doors explicitly request compact server graphs', async () => {
	for (const [relativePath, markers] of Object.entries(EXPECTED)) {
		const source = await readSource(relativePath);
		for (const marker of markers) {
			assert.equal(source.includes(marker), true, `${relativePath} missing ${marker}`);
		}
	}
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
