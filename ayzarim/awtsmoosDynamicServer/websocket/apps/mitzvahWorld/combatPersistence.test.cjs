// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatPersistence.test.cjs
 * @description Proves creature defeat, sparks, combat, and adventure progress survive restart.
 * The Awtsmoos renews the world beyond process replacement; Awtsmoos.com preserves
 * lawful outcomes while transport, animation, and pending attack intent disappear.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { createTokenFactory } = require('./sessionTestSupport.cjs');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('combat and adventure state restore with one resumable player', async () => {
	let now = 5_000;
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => now,
		gracePeriodMs: 10_000,
		persistence,
		tokenFactory: createTokenFactory()
	};
	const first = createMmorpgHarness(options);
	const flow = first.flow('persistent-combat-player');
	const joined = await flow.join('Persistent Defender');
	const room = first.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const creature = room.creatures.get('dybbuk-1');
	player.position = beside(creature.position);
	await flow.send('adventure.start', { questId: 'sparks-at-east-gate' });
	while (creature.status === 'active') {
		await flow.send('combat.attack', {
			creatureId: creature.id,
			intent: 'defense',
			weaponId: 'wooden-staff'
		});
		now += 701;
	}
	await first.platform.disconnect(flow.client);

	const second = createMmorpgHarness(options);
	const resumed = second.flow('persistent-combat-resume');
	const response = await resumed.send('world.join', {
		resumeToken: joined.payload.session.resumeToken
	});
	assert.equal(response.payload.playerId, joined.payload.playerId);
	const restoredRoom = second.directory.rooms.get('main-village');
	const restoredPlayer = restoredRoom.players.get(joined.payload.playerId);
	const restoredCreature = restoredRoom.creatures.get('dybbuk-1');
	assert.equal(restoredCreature.status, 'defeated');
	assert.equal(restoredCreature.health, 0);
	assert.equal(restoredPlayer.refinedSparks, 2);
	assert.equal(restoredPlayer.adventureQuests['sparks-at-east-gate'].count, 1);
	assert.equal(restoredPlayer.adventureQuests['sparks-at-east-gate'].status, 'active');
	assert.equal(restoredPlayer.combat.status, 'active');
});

function beside(position) {
	return { x: position.x + 1, y: position.y, z: position.z };
}
