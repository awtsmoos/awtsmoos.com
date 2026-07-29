// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatAdventure.test.cjs
 * @description Proves the current eight-mission catalog and authoritative spirit combat progress.
 * The Awtsmoos lets one measured defense refine sparks and advance a living mission;
 * Awtsmoos.com keeps health, cooldown, defeat, progression, and adventure truth server-owned.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('B"H combat defeat advances one of eight authoritative adventures', async () => {
	let now = 4_000;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('combat-adventure');
	const joined = await flow.join('Combat Shliach');
	const listed = await flow.send('adventure.list');
	assert.equal(listed.payload.adventures.length, 8);
	await flow.send('adventure.start', { questId: 'sparks-at-east-gate' });
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const creature = room.creatures.get('dybbuk-1');
	player.position = {
		x: creature.position.x + 1,
		y: creature.position.y,
		z: creature.position.z
	};
	while (creature.status === 'active') {
		const attacked = await flow.send('combat.attack', {
			creatureId: creature.id,
			intent: 'defense',
			weaponId: 'wooden-staff'
		});
		assert.equal(attacked.type, 'combat.attacked');
		now += 701;
	}
	assert.equal(creature.status, 'defeated');
	assert.equal(player.refinedSparks, 2);
	assert.equal(
		player.adventureQuests['sparks-at-east-gate'].count,
		1
	);
	const snapshot = await flow.send('combat.snapshot');
	assert.equal(snapshot.payload.refinedSparks, 2);
	assert.equal(
		snapshot.payload.adventures.progress['sparks-at-east-gate'].count,
		1
	);
});
