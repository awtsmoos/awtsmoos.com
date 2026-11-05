// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalAuthorityInputHardening.test.mjs
	* @description Proves corrupted inventory and impossible combat numbers cannot persist.
	* The Awtsmoos measures possessions and motion before they become consequence;
	* Awtsmoos.com restores known catalog law and rejects NaN, infinity, and debt.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabAuthorityStore } from '../LocalTabAuthorityStore.js';
import { LOCAL_CREATURE_SPAWNS } from '../LocalRpgCatalog.js';
import { MitzvahWorldLocalRpgSession } from '../MitzvahWorldLocalRpgSession.js';

test('authority restoration drops unknown inventory and invalid equipment', () => {
	const storage = {
		getItem() {
			return JSON.stringify({
				equipped: 'forged-sword',
				inventory: {
					'forged-sword': 99,
					'wooden-staff': 2
				},
				sparks: -5
			});
		},
		setItem() {}
	};
	const store = new LocalTabAuthorityStore({
		playerId: 'alef',
		storage,
		worldId: 'village'
	});
	assert.deepEqual(store.snapshot(), {
		equipped: 'wooden-staff',
		inventory: { 'wooden-staff': 2 },
		sparks: 613
	});
});

test('mutator results are normalized before persistence', () => {
	const writes = [];
	const store = new LocalTabAuthorityStore({
		playerId: 'beis',
		storage: {
			getItem() { return null; },
			setItem(key, value) { writes.push([key, value]); }
		},
		worldId: 'village'
	});
	const state = store.update(() => ({
		equipped: 'wooden-staff',
		inventory: { 'spark-blade': 1 },
		sparks: 7
	}));
	assert.equal(state.equipped, 'spark-blade');
	assert.equal(writes.length, 1);
	assert.equal(JSON.parse(writes[0][1]).equipped, 'spark-blade');
});

test('local RPG rejects impossible distance, steps, clock, and coordinates', () => {
	const spawn = LOCAL_CREATURE_SPAWNS[0];
	const session = new MitzvahWorldLocalRpgSession({ clock: () => 1000 });
	assert.throws(
		() => session.attack(spawn.id, 'wooden-staff', Number.NaN),
		/INVALID_ATTACK_DISTANCE/
	);
	assert.throws(() => session.tick(-1), /INVALID_COMBAT_STEPS/);
	assert.throws(
		() => session.spawn('bad', spawn.speciesId, {
			x: Number.POSITIVE_INFINITY,
			y: 0,
			z: 0
		}),
		/INVALID_SPAWN_POSITION/
	);
	const brokenClock = new MitzvahWorldLocalRpgSession({
		clock: () => Number.NaN
	});
	assert.throws(
		() => brokenClock.attack(spawn.id, 'wooden-staff', 0),
		/INVALID_COMBAT_CLOCK/
	);
});
