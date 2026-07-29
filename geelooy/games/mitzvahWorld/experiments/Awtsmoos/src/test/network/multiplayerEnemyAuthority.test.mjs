// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiplayerEnemyAuthority.test.mjs
 * @description Proves actor mapping, server range, attack, defeat, loot, interest, and release.
 * The Awtsmoos lets one rendered husk answer one authoritative creature; Awtsmoos.com verifies
 * equipped weapon truth, exact inventory, dedicated progress, hidden scope, and solo restoration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { activateMinimalCombat } from '../../app/MinimalMeadowCombatCastRuntime.js';
import { MultiplayerEnemyAuthorityBridge } from '../../network/MultiplayerEnemyAuthorityBridge.js';

test('B"H deployed enemy authority owns attack, corpse, loot, and visibility', async () => {
	const calls = [];
	let quantity = 0;
	let dedicatedDefeats = 0;
	const runtime = runtimeFixture(() => { dedicatedDefeats += 1; }, {
		add: (_id, value) => { quantity += value; },
		quantity: () => quantity,
		remove: (_id, value) => { quantity -= value; }
	});
	const actor = actorFixture(runtime);
	runtime.enemies.actors.push(actor);
	const client = {
		mmorpg: { rpg: {
			attack: async (creatureId, weaponId, intent) => {
				calls.push(['attack', creatureId, weaponId, intent]);
				return { payload: {
					adventures: {},
					creature: creature('defeated', 0, 'available'),
					damage: 9,
					refinedSparks: 1
				} };
			},
			loot: async creatureId => {
				calls.push(['loot', creatureId]);
				return { payload: {
					adventures: {},
					creature: creature('defeated', 0, 'claimed'),
					inventory: { inventory: [{ itemId: 'shadow-remnant', quantity: 1 }] },
					loot: { itemId: 'shadow-remnant', quantity: 1 }
				} };
			}
		} }
	};
	const bridge = new MultiplayerEnemyAuthorityBridge(client, runtime);
	bridge.sync({ creatures: [creature('active', 20, 'available')] });
	assert.equal(actor.serverCreatureId, 'dybbuk-1');
	assert.equal(actor.health, 20);
	assert.equal(bridge.rangeFor(), 4.2);
	const attacked = await bridge.attack(actor, 'hebrew-fire');
	assert.equal(attacked.damage, 9);
	assert.deepEqual(calls[0], ['attack', 'dybbuk-1', 'wooden-staff', 'defense']);
	assert.equal(actor.alive, false);
	assert.equal(dedicatedDefeats, 1);
	await bridge.claimLoot(actor);
	assert.equal(quantity, 1);
	assert.equal(actor.looted, true);
	bridge.sync({ creatures: [] });
	assert.equal(actor.group.visible, false);
	bridge.stop();
	assert.equal(actor.group.visible, true);
	assert.equal(actor.authoritative, false);
});

test('B"H cast activation uses authoritative server range before launch', () => {
	const target = { alive: true };
	const combat = {
		cast: null,
		castPayload: () => ({}),
		cooldownRemaining: () => 0,
		distanceTo: () => 10,
		faceTarget() {},
		reject: (code, payload) => ({ accepted: false, code, payload }),
		runtime: {
			bus: { emit() {} },
			enemies: { selected: target },
			enemyAuthority: { controls: () => true, rangeFor: () => 4.2 }
		}
	};
	const actions = {
		blast: { castTime: 1, cooldown: 2, label: 'Blast', range: 38 }
	};
	const rejected = activateMinimalCombat(combat, actions, 'blast');
	assert.equal(rejected.code, 'TARGET_OUT_OF_RANGE');
	assert.equal(rejected.payload.range, 4.2);
	combat.distanceTo = () => 3;
	const accepted = activateMinimalCombat(combat, actions, 'blast');
	assert.equal(accepted.accepted, true);
	assert.equal(combat.cast.range, 4.2);
});

function creature(status, health, lootStatus) {
	return {
		health,
		id: 'dybbuk-1',
		lootStatus,
		maximumHealth: 28,
		position: { x: 4, y: 0, z: 5 },
		status
	};
}

function runtimeFixture(recordDefeat, inventory) {
	return {
		bus: { emit() {} },
		enemies: { actors: [] },
		inventory,
		quest: { recordDefeat },
		questStore: { synchronize() {} }
	};
}

function actorFixture(runtime) {
	return {
		action: 'idle',
		alive: true,
		bus: runtime.bus,
		deathTime: 0,
		group: { position: { x: 0, y: 0, z: 0 }, visible: true },
		health: 28,
		looted: false,
		moving: false,
		payload: () => ({ id: 'even-koved' }),
		profile: { id: 'even-koved', maxHealth: 28 },
		runtime,
		selected: false
	};
}
