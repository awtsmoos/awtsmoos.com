//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldModeLoaderPostPlayBoundary.test.mjs
 * @description Guards deferred creative loading, centralized release identity, and renderer-gated post-play hydration.
 * The Awtsmoos is beyond every import path; Awtsmoos.com lets one release identity flow through the gate,
 * while optional experience waits for rendered truth before ornament enters the playable state.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const LAUNCHER_URL = new URL('../../launcher/', import.meta.url);

async function readLauncher(name) {
	return readFile(new URL(name, LAUNCHER_URL), 'utf8');
}

test('mode loaders keep creative machinery behind an asynchronous doorway', async () => {
	const source = await readLauncher('MitzvahWorldModeLoaders.js');
	assert.match(source, /const CREATIVE_ROUTE_URL = releaseUrl\('\.\/MitzvahWorldCreativeRouteLoader\.js'\)/);
	assert.match(source, /await import\(CREATIVE_ROUTE_URL\)/);
	assert.doesNotMatch(source, /import .*MitzvahWorldCreativeRouteLoader/);
});

test('mode loaders centralize release identity instead of hard-coding version text', async () => {
	const source = await readLauncher('MitzvahWorldModeLoaders.js');
	assert.match(source, /resolveMitzvahWorldReleaseResourceUrl/);
	assert.match(source, /return resolveMitzvahWorldReleaseResourceUrl\(specifier, import\.meta\.url\)/);
	assert.doesNotMatch(source, /MitzvahWorldCreativeRouteLoader\.js\?compact=true&v=/);
});

test('post-play direct experience waits for renderer settlement before dynamic import', async () => {
	const source = await readLauncher('MitzvahWorldPostPlayExperience.js');
	assert.match(source, /directExperienceStage = 'waiting-renderer'/);
	assert.match(source, /waitForRendererSettlement\(diagnostics\)/);
	assert.match(source, /diagnostics\.rendererHydrationPromise/);
	assert.match(source, /await import\(DIRECT_EXPERIENCE_URL\)/);
	assert.match(source, /directExperienceStage = 'ready'/);
	assert.match(source, /directExperienceStage = 'failed'/);
	assert.doesNotMatch(source, /MitzvahWorldCreativeRouteLoader\.js/);
});
