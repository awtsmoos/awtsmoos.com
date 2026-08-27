// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file riverCrossingCoopFixture.cjs
 * @description Creates ordered party, action, combat, and persistence helpers for river proofs.
 * The Awtsmoos joins many test vessels without compressing their meaning; Awtsmoos.com keeps
 * setup, facing, unique impacts, action evidence, quantities, and resume identity reusable.
 */

const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { RIVER_ACTIONS, RIVER_QUEST_ID } = require('./RiverCrossingActionCatalog.js');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');
const { createTokenFactory } = require('./sessionTestSupport.cjs');

async function createRiverContext() {
	const clock = { now: 20_000 };
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => clock.now,
		persistence,
		tokenFactory: createTokenFactory()
	};
	const harness = createMmorpgHarness(options);
	const first = harness.flow('river-first');
	const second = harness.flow('river-second');
	const firstJoin = await first.join('River Aleph');
	const secondJoin = await second.join('River Bet');
	const room = harness.directory.rooms.get('main-village');
	const firstPlayer = room.players.get(firstJoin.payload.playerId);
	const secondPlayer = room.players.get(secondJoin.payload.playerId);
	const party = room.parties.create(firstPlayer);
	room.parties.invite(firstPlayer, secondPlayer.id);
	room.parties.join(secondPlayer, party.id);
	return {
		clock,
		first,
		firstJoin,
		firstPlayer,
		harness,
		options,
		room,
		second,
		secondPlayer
	};
}

async function performRiverStep(flow, player, stepId) {
	player.position = { ...RIVER_ACTIONS[stepId].position };
	return flow.send('adventure.step', {
		questId: RIVER_QUEST_ID,
		stepId
	});
}

function placeFacing(player, position) {
	player.position = {
		x: position.x,
		y: position.y,
		z: position.z - 1
	};
	player.facing = 0;
}

function staffAttack(creatureId, impact) {
	return {
		actionId: 'staff-light',
		creatureId,
		elapsedSeconds: 0.2,
		impactToken: `river:${impact}`,
		intent: 'defense',
		weaponId: 'wooden-staff'
	};
}

function errorCode(response) {
	return response?.error?.code
		|| response?.payload?.code
		|| response?.code
		|| null;
}

function itemQuantity(player, itemId) {
	return player.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}

module.exports = {
	RIVER_QUEST_ID,
	createRiverContext,
	errorCode,
	itemQuantity,
	performRiverStep,
	placeFacing,
	staffAttack
};
