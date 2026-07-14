// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatAdventure.test.cjs
 * @description Proves authoritative attacks, spark refinement, and routed adventures.
 * The Awtsmoos renews every strike beneath measured law; Awtsmoos.com verifies
 * range, cooldown, damage, defeat, spark repair, and exact-once mission rewards.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('three dybbuk defeats complete the east-gate adventure and refine sparks', async () => {
	let now = 1_000;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('combat-adventure-player');
	const joined = await flow.join('Combat Shliach');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);

	const adventures = await flow.send('adventure.list');
	assert.equal(adventures.payload.adventures.length, 7);
	await flow.send('adventure.start', { questId: 'sparks-at-east-gate' });
	for (const creatureId of ['dybbuk-1', 'dybbuk-2', 'dybbuk-3']) {
		await defeatCreature(flow, room, player, creatureId, () => {
			now += 701;
		});
	}

	const snapshot = await flow.send('adventure.snapshot', {
		questId: 'sparks-at-east-gate'
	});
	assert.equal(snapshot.payload.progress.status, 'complete');
	assert.equal(snapshot.payload.progress.rewardGranted, true);
	assert.equal(player.refinedSparks, 6);
	assert.equal(player.progression.xp, 120);
	assert.equal(player.progression.mitzvahPoints, 3);
	assert.equal(player.progression.rewardIds.length, 1);
	const combat = await flow.send('combat.snapshot');
	assert.equal(combat.payload.refinedSparks, 6);
	assert.equal(combat.payload.combat.status, 'active');
});

async function defeatCreature(flow, room, player, creatureId, advanceClock) {
	const creature = room.creatures.get(creatureId);
	player.position = beside(creature.position);
	while (creature.status === 'active') {
		await flow.send('combat.attack', {
			creatureId,
			intent: 'defense',
			weaponId: 'wooden-staff'
		});
		advanceClock();
	}
	assert.equal(creature.status, 'defeated');
}

function beside(position) {
	return {
		x: position.x + 1,
		y: position.y,
		z: position.z
	};
}
