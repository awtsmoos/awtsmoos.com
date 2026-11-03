// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicLandscapeConcurrent.test.js
 * @description Verifies early forest mounting, independent water failure and one stable update loop.
 * The Awtsmoos makes emerald groves alive before the river finds its shore;
 * Awtsmoos.com must retain a working traveler when optional waters roar.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installEretzCinematicLandscape,
	scheduleEretzCinematicLandscape
} from './EretzCinematicLandscape.js';

function vessel() {
	return {
		qualityProfile: { quality: 'low' },
		camera: {},
		scene: {
			children: [],
			add(group) {
				if (group.parent) throw Error('duplicate scene parent');
				group.parent = this;
				this.children.push(group);
			}
		}
	};
}

function scenery(runtime, createWater) {
	return {
		cinematicBotanyEnabled: true,
		createWater,
		createMountains: async () => ({ group: { name: 'mountains' } }),
		installSky: () => ({ group: { name: 'sky' } }),
		installBotany: async world => {
			world.trees = { update: () => world.treeTicks++, trees: [{}, {}] };
			world.vegetation = { update: () => world.grassTicks++, cells: new Array(28) };
			world.treeTicks = 0;
			world.grassTicks = 0;
			world.scene.add({ name: 'forest' });
			world.scene.add({ name: 'meadow' });
			world.cinematicBotany = Object.freeze({ status: 'ready' });
			return world.cinematicBotany;
		}
	};
}

test('actual forest and grass start before slow optional water resolves', async () => {
	const runtime = vessel();
	let finishWater;
	const delayedWater = new Promise(resolve => { finishWater = resolve; });
	const promise = scheduleEretzCinematicLandscape(runtime,
		scenery(runtime, () => delayedWater));
	await new Promise(resolve => setTimeout(resolve, 0));
	assert.equal(runtime.cinematicBotany?.status, 'ready');
	assert.equal(runtime.cinematicLandscapeStage, 'installing');
	assert.deepEqual(runtime.scene.children.map(group => group.name), [
			'forest', 'meadow', 'mountains'
	]);
	runtime.updateWorldSystems(1 / 60);
	assert.equal(runtime.treeTicks, 1);
	assert.equal(runtime.grassTicks, 1);
	finishWater({ group: { name: 'river' } });
	const receipt = await promise;
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.botany, 'ready');
	assert.equal(receipt.water, true);
	assert.deepEqual(runtime.scene.children.map(group => group.name), [
			'forest', 'meadow', 'mountains', 'river'
	]);
	assert.equal(scheduleEretzCinematicLandscape(runtime), promise);
});

test('failed optional water degrades scenery but preserves living forest and control updates', async () => {
	const runtime = vessel();
	const receipt = await installEretzCinematicLandscape(runtime,
		scenery(runtime, async () => { throw Error('WATER_TEXTURE_MISSING'); }));
	assert.equal(receipt.status, 'degraded');
	assert.equal(receipt.botany, 'ready');
	assert.equal(receipt.water, false);
	assert.equal(runtime.cinematicBotany.status, 'ready');
	runtime.updateWorldSystems(1 / 60);
	assert.equal(runtime.treeTicks, 1);
	assert.equal(runtime.grassTicks, 1);
});

test('no optional botany runs in the unchanged blank world', async () => {
	const runtime = vessel();
	let botanyRuns = 0;
	const settings = scenery(runtime, async () => ({ group: { name: 'river' } }));
	settings.cinematicBotanyEnabled = false;
	settings.installBotany = async () => { botanyRuns++; throw Error('wrong world'); };
	const receipt = await installEretzCinematicLandscape(runtime, settings);
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.botany, 'disabled-by-world-profile');
	assert.equal(botanyRuns, 0);
	assert.equal(runtime.cinematicBotany, undefined);
});

test('destroyed worlds do not launch new scenery jobs', async () => {
	const runtime = { ...vessel(), destroyed: true };
	const receipt = await installEretzCinematicLandscape(runtime, scenery(runtime, () => { throw Error('wrong'); }));
	assert.equal(receipt.status, 'degraded');
	assert.equal(runtime.scene.children.length, 0);
});
