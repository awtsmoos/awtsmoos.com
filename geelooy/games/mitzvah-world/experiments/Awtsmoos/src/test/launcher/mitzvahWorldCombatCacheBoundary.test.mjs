//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldCombatCacheBoundary.test.mjs
 * @description Guards one release-resolved boot-to-playable chain through generated foundation/core artifacts.
 * The Awtsmoos renews every authored doorway through one shared release resolver; Awtsmoos.com proves launcher,
 * mode runtime, deferred app modules, and generated first-play chunks cannot split into stale cache identities.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_ROOT = new URL('../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, SOURCE_ROOT), 'utf8');

test('direct world chain reaches release-resolved generated foundation and core artifacts', async () => {
	const [boot, modes, runtime, staged] = await Promise.all([
		source('launcher/bootMitzvahWorldPage.js'),
		source('launcher/MitzvahWorldModeLoaders.js'),
		source('app/createEretzRuntime.js'),
		source('app/EretzStagedRuntime.js')
	]);
	assert.match(boot, /resolveMitzvahWorldReleaseResourceUrl/);
	assert.match(boot, /MitzvahWorldLauncher\.js/);
	assert.match(modes, /resolveMitzvahWorldReleaseResourceUrl/);
	assert.match(modes, /createEretzRuntime\.js/);
	assert.match(runtime, /resolveDeferredAppModuleUrl/);
	assert.match(staged, /mitzvah-world-foundation\.compact\.js/);
	assert.match(staged, /mitzvah-world-core\.compact\.js/);
	assert.match(staged, /resolveGeneratedRuntimeChunkUrl/);
	assert.doesNotMatch(staged, /responsive-foundation|responsive-core/);
});
