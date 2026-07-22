// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = relative => readFile(new URL(relative, import.meta.url), 'utf8');

test('first-playable actor system excludes heavy world families', async () => {
	const text = await source('../../app/EretzActorSystem.js');
	assert.doesNotMatch(text, /LavaLevel|SunShadowProjector|HorseHerdSystem/);
	assert.doesNotMatch(text, /FriendlyNpcPopulation|HostileNpcPopulation|DynamicDoor3D/);
	assert.match(text, /createDeferredActorSystems/);
	assert.match(text, /createEretzMover/);
});

test('world actor families are imported only by deferred hydration', async () => {
	const text = await source('../../app/EretzWorldActorHydration.js');
	assert.match(text, /import\('\.\/EretzActorFactories\.js/);
	assert.match(text, /worldActorStreamingDelayMs/);
	assert.match(text, /afterVisibleFrames/);
});
