// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRpgApi.test.mjs
 * @description Proves timed browser RPG methods against the real authoritative server router.
 * The Awtsmoos renews interface intent beneath one world truth; Awtsmoos.com verifies missions,
 * facing, unique impacts, sparks, private loot recovery, and the complete public creature roster.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('browser RPG facade defeats and recovers one authoritative spirit remnant', async () => {
	let now = 3_000;
	let impact = 0;
	const harness = createBridgeHarness({ clock: () => now });
	const client = new MitzvahWorldRealtimeClient(harness.createSocket('rpg-browser'));
	const joined = await client.join('Browser Defender');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const creature = room.creatures.get('dybbuk-1');
	placeFacing(player, creature.position);
	assert.equal(typeof client.mmorpg.economy.balance, 'function');
	assert.equal(typeof client.mmorpg.community.mailSnapshot, 'function');
	assert.equal(typeof client.mmorpg.rpg.loot, 'function');
	assert.equal(typeof client.mmorpg.rpg.adventureStep, 'function');
	assert.equal((await client.mmorpg.rpg.adventures()).payload.adventures.length, 8);
	await client.mmorpg.rpg.startAdventure('sparks-at-east-gate');
	while (creature.status === 'active') {
		impact += 1;
		await client.mmorpg.rpg.attack(creature.id, {
			actionId: 'staff-light',
			elapsedSeconds: 0.2,
			impactToken: `browser:${impact}`,
			intent: 'defense',
			weaponId: 'wooden-staff'
		});
		now += 701;
	}
	const combat = await client.mmorpg.rpg.combatSnapshot();
	assert.equal(combat.payload.refinedSparks, 2);
	assert.equal(combat.payload.adventures.progress['sparks-at-east-gate'].count, 1);
	const looted = await client.mmorpg.rpg.loot(creature.id);
	assert.equal(looted.type, 'loot.claimed');
	assert.deepEqual(looted.payload.loot, { itemId: 'shadow-remnant', quantity: 1 });
	assert.equal(
		looted.payload.inventory.inventory.find(item => item.itemId === 'shadow-remnant').quantity,
		1
	);
	assert.equal(looted.payload.creature.lootStatus, 'claimed');
	assert.equal(looted.payload.creature.lootClaimedBy, undefined);
	const inventory = await client.mmorpg.inventory();
	assert.equal(
		inventory.payload.inventory.find(item => item.itemId === 'shadow-remnant').quantity,
		1
	);
	const creatures = await client.mmorpg.rpg.creatures();
	assert.equal(creatures.payload.creatures.length, 18);
	assert.equal(
		creatures.payload.creatures.find(item => item.id === creature.id).lootStatus,
		'claimed'
	);
});

function placeFacing(player, position) {
	player.position = { x: position.x, y: position.y, z: position.z - 1 };
	player.facing = 0;
}
