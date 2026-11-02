// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicBotany.test.js
 * @description Tests genuine idempotent post-play ecology mounting with independent world policies.
 * The Awtsmoos clothes a chosen valley in leaves and living grass;
 * Awtsmoos.com leaves the blank ground clear and lets true seasons pass.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installEretzCinematicBotany } from './EretzCinematicBotany.js';
import { installEretzCinematicLandscape } from './EretzCinematicLandscape.js';

/** A minimal real parent relationship to catch duplicate scene mounts. */
function scene() {
	return {
		children: [],
		add(group) {
			if (group.parent) throw new Error('DUPLICATE_SCENE_PARENT');
			group.parent = this;
			this.children.push(group);
		}
	};
}

function runtime() {
	return { camera: {}, qualityProfile: { quality: 'low' }, scene: scene() };
}

function systems() {
	const counts = { trees: 0, vegetation: 0, forestUpdates: 0, meadowUpdates: 0 };
	return {
		counts,
		createTrees: async () => {
			counts.trees += 1;
			return { group: { name: 'forest' }, trees: [{}, {}], update: () => counts.forestUpdates++ };
		},
		createVegetation: async () => {
			counts.vegetation += 1;
			return { group: { name: 'grass' }, cells: new Array(28), update: () => counts.meadowUpdates++ };
		}
	};
}

test('selected Lush Meadow mounts actual forest and all bounded grass cells once', async () => {
	const world = runtime();
	const mocks = systems();
	const [first, second] = await Promise.all([
		installEretzCinematicBotany(world, mocks),
		installEretzCinematicBotany(world, mocks)
	]);
	assert.equal(first, second);
	assert.deepEqual(mocks.counts, {
		trees: 1, vegetation: 1, forestUpdates: 0, meadowUpdates: 0
	});
	assert.deepEqual(world.scene.children.map(item => item.name), ['forest', 'grass']);
	assert.equal(first.forestCount, 2);
	assert.equal(first.meadowCellCount, 28);
	assert.equal(first.status, 'ready');
	assert.equal(await installEretzCinematicBotany(world, mocks), first);
});

test('failed optional vegetation reports degraded without claiming successful greenery', async () => {
	const world = runtime();
	const mocks = systems();
	mocks.createVegetation = async () => { throw new Error('MISSING_GRASS'); };
	const receipt = await installEretzCinematicBotany(world, mocks);
	assert.equal(receipt.status, 'degraded');
	assert.match(receipt.message, /MISSING_GRASS/);
	assert.equal(world.cinematicBotanyStage, 'degraded');
	assert.equal(world.cinematicBotany, undefined);
});

test('unselected original landscape uses sky, mountains and water without any botany', async () => {
	const world = runtime();
	const mocks = systems();
	const receipt = await installEretzCinematicLandscape(world, {
		cinematicBotanyEnabled: false,
		createMountains: async () => ({ group: { name: 'mountains' } }),
		createWater: async () => ({ group: { name: 'water' } }),
		installSky: () => ({ group: { name: 'sky' } }),
		installBotany: () => { throw new Error('BOTANY_POLICY_BYPASSED'); }
	});
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.botany, 'disabled-by-world-profile');
	assert.equal(world.cinematicBotany, undefined);
	assert.deepEqual(world.scene.children.map(item => item.name), ['mountains', 'water']);
	assert.deepEqual(mocks.counts, {
		trees: 0, vegetation: 0, forestUpdates: 0, meadowUpdates: 0
	});
});

test('lush landscape update chain runs both botanical systems after initial control', async () => {
	const world = runtime();
	const mocks = systems();
	let priorUpdates = 0;
	world.updateWorldSystems = () => priorUpdates++;
	const receipt = await installEretzCinematicLandscape(world, {
		cinematicBotanyEnabled: true,
		createMountains: async () => ({ group: { name: 'mountains' } }),
		createWater: async () => ({ group: { name: 'water' } }),
		installSky: () => ({ group: { name: 'sky' } }),
		installBotany: value => installEretzCinematicBotany(value, mocks)
	});
	assert.equal(receipt.botany, 'ready');
	world.updateWorldSystems(0.016);
	assert.equal(priorUpdates, 1);
	assert.equal(mocks.counts.forestUpdates, 1);
	assert.equal(mocks.counts.meadowUpdates, 1);
	assert.equal(world.scene.children.length, 4);
});
