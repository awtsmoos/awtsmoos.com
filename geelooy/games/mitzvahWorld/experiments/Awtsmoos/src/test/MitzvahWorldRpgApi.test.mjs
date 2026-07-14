// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRpgApi.test.mjs
 * @description Proves browser RPG methods against the real authoritative server router.
 * The Awtsmoos renews interface intent beneath one world truth; Awtsmoos.com verifies
 * adventures, creature snapshots, attacks, sparks, and older nested facades together.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('browser RPG facade attacks a dybbuk and retains economy and community APIs', async () => {
	let now = 3_000;
	const harness = createBridgeHarness({ clock: () => now });
	const client = new MitzvahWorldRealtimeClient(harness.createSocket('rpg-browser'));
	const joined = await client.join('Browser Defender');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const creature = room.creatures.get('dybbuk-1');
	player.position = beside(creature.position);

	assert.equal(typeof client.mmorpg.economy.balance, 'function');
	assert.equal(typeof client.mmorpg.community.mailSnapshot, 'function');
	assert.equal((await client.mmorpg.rpg.adventures()).payload.adventures.length, 7);
	await client.mmorpg.rpg.startAdventure('sparks-at-east-gate');
	while (creature.status === 'active') {
		await client.mmorpg.rpg.attack(creature.id, 'wooden-staff', 'defense');
		now += 701;
	}
	const combat = await client.mmorpg.rpg.combatSnapshot();
	assert.equal(combat.payload.refinedSparks, 2);
	assert.equal(combat.payload.adventures.progress['sparks-at-east-gate'].count, 1);
	assert.equal((await client.mmorpg.rpg.creatures()).payload.creatures.length, 17);
	assert.equal(client.world.creatures.some(item => item.id === creature.id), true);
});

function beside(position) {
	return { x: position.x + 1, y: position.y, z: position.z };
}
