// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzCinematicLandscape.test.mjs
 * @description Proves the simple-world visual landscape mounts only sky, mountains, and water, preserves prior update ownership, and degrades safely.
 * The Awtsmoos joins horizon, ridge, and current without multiplying worlds;
 * Awtsmoos.com measures that these visual vessels may deepen the meadow while simulation truth and the traveler's heartbeat remain untouched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installEretzCinematicLandscape,
	scheduleEretzCinematicLandscape
} from '../../app/EretzCinematicLandscape.js';

function sceneFixture() {
	return {
		children: [],
		add(group) {
			group.parent = this;
			this.children.push(group);
		}
	};
}

test('B"H cinematic landscape mounts three visual owners and preserves cadence', async () => {
	const calls = [];
	const scene = sceneFixture();
	const runtime = {
		camera: {},
		qualityProfile: { quality: 'high' },
		scene,
		updateWorldSystems(deltaSeconds) {
			calls.push(['previous', deltaSeconds]);
		}
	};
	const sky = { group: { name: 'sky' }, update() { calls.push(['sky']); } };
	const mountains = { group: { name: 'mountains' } };
	const water = { group: { name: 'water' }, update(deltaSeconds) { calls.push(['water', deltaSeconds]); } };
	const receipt = await installEretzCinematicLandscape(runtime, {
		createMountains: async () => mountains,
		createWater: async () => water,
		installSky: () => {
			scene.add(sky.group);
			return sky;
		}
	});
	assert.deepEqual(receipt, {
		mountains: true,
		sky: true,
		status: 'ready',
		water: true
	});
	assert.deepEqual(scene.children.map(group => group.name), ['sky', 'mountains', 'water']);
	runtime.updateWorldSystems(0.25);
	assert.deepEqual(calls, [['previous', 0.25], ['sky'], ['water', 0.25]]);
	assert.equal(await installEretzCinematicLandscape(runtime), receipt);
});

test('B"H cinematic landscape scheduling degrades instead of rejecting gameplay', async () => {
	const runtime = { camera: {}, qualityProfile: { quality: 'high' }, scene: sceneFixture() };
	const receipt = await scheduleEretzCinematicLandscape(runtime, {
		createMountains: async () => ({ group: { name: 'mountains' } }),
		createWater: async () => { throw new Error('water unavailable'); },
		installSky: () => ({ group: { name: 'sky' }, update() {} })
	});
	assert.equal(receipt.status, 'degraded');
	assert.equal(runtime.cinematicLandscapeStage, 'degraded');
	assert.match(receipt.message, /water unavailable/);
});
