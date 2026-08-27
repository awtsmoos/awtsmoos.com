// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file corpseLootAuthority.test.cjs
 * @description Proves one defeated spirit yields one replay-safe persisted private remnant.
 * The Awtsmoos lets a public husk bear one claimed sign while Awtsmoos.com keeps claimant
 * identity and inventory private, rejecting a second hand and restoring truth after restart.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');
const { createTokenFactory, sendRequest } = require('./sessionTestSupport.cjs');

test('B"H corpse loot is single-claim, replay-safe, private, and persistent', async () => {
	let now = 7_000;
	let impactSequence = 0;
	const persistence = new MemoryWorldPersistence();
	const options = { clock: () => now, gracePeriodMs: 10_000, persistence, tokenFactory: createTokenFactory() };
	const firstHarness = createMmorpgHarness(options);
	const first = firstHarness.flow('loot-first');
	const second = firstHarness.flow('loot-second');
	const firstJoined = await first.join('First Recoverer');
	const secondJoined = await second.join('Second Recoverer');
	const room = firstHarness.directory.rooms.get('main-village');
	const creature = room.creatures.get('dybbuk-1');
	const firstPlayer = room.players.get(firstJoined.payload.playerId);
	const secondPlayer = room.players.get(secondJoined.payload.playerId);
	faceBeside(firstPlayer, creature.position);
	faceBeside(secondPlayer, creature.position);
	while (creature.status === 'active') {
		impactSequence += 1;
		const response = await first.send('combat.attack', attack(creature.id, `loot:${impactSequence}`));
		assert.equal(response.type, 'combat.attacked');
		now += 701;
	}
	const requestId = 'loot-replay-proof';
	const sequence = first.sequence + 1;
	const claimed = await sendRequest(first.platform, first.client, 'loot.claim', { creatureId: creature.id }, requestId, sequence);
	const replay = await sendRequest(first.platform, first.client, 'loot.claim', { creatureId: creature.id }, requestId, sequence);
	assert.deepEqual(replay, claimed);
	assert.equal(claimed.type, 'loot.claimed');
	assert.equal(creature.lootClaimedBy, firstJoined.payload.playerId);
	assert.equal(publicCreature(room, creature.id).lootStatus, 'claimed');
	assert.equal(publicCreature(room, creature.id).lootClaimedBy, undefined);
	assert.equal(itemQuantity(firstPlayer, 'shadow-remnant'), 1);
	const denied = await second.send('loot.claim', { creatureId: creature.id });
	assert.equal(errorCode(denied), 'CORPSE_ALREADY_LOOTED');
	assert.equal(itemQuantity(secondPlayer, 'shadow-remnant'), 0);
	await firstHarness.platform.disconnect(first.client);
	await firstHarness.platform.disconnect(second.client);
	const restoredHarness = createMmorpgHarness(options);
	const resumed = restoredHarness.flow('loot-resume');
	await resumed.send('world.join', { resumeToken: firstJoined.payload.session.resumeToken });
	const restoredRoom = restoredHarness.directory.rooms.get('main-village');
	const restoredCreature = restoredRoom.creatures.get(creature.id);
	const restoredPlayer = restoredRoom.players.get(firstJoined.payload.playerId);
	assert.equal(restoredCreature.lootClaimedBy, firstJoined.payload.playerId);
	assert.equal(publicCreature(restoredRoom, creature.id).lootStatus, 'claimed');
	assert.equal(itemQuantity(restoredPlayer, 'shadow-remnant'), 1);
});

function attack(creatureId, impactToken) { return { actionId: 'staff-light', creatureId, elapsedSeconds: 0.2, impactToken, intent: 'defense', weaponId: 'wooden-staff' }; }
function faceBeside(player, position) { player.position = { x: position.x + 1, y: position.y, z: position.z }; player.facing = Math.atan2(position.x - player.position.x, position.z - player.position.z); }
function errorCode(response) { return response?.error?.code || response?.payload?.code || response?.code || null; }
function itemQuantity(player, itemId) { return player.inventory.find(item => item.itemId === itemId)?.quantity || 0; }
function publicCreature(room, creatureId) { return room.creatures.snapshots().find(creature => creature.id === creatureId); }
