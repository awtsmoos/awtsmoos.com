// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file riverCrossingCoop.test.cjs
 * @description Proves ordered party progress, separate rewards, one bridge effect, and restart truth.
 * The Awtsmoos joins two travelers in one repair without merging their identities; Awtsmoos.com
 * verifies location, evidence, battle, reward, public light, and persistence through real handlers.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { RIVER_ACTIONS, RIVER_QUEST_ID } = require('./RiverCrossingActionCatalog.js');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');
const { createTokenFactory } = require('./sessionTestSupport.cjs');

test('B"H two party members repair the River Crossing with personal exact rewards', {
	timeout: 30000
}, async () => {
	let now = 20_000;
	const persistence = new MemoryWorldPersistence();
	const options = { clock: () => now, persistence, tokenFactory: createTokenFactory() };
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
	await first.send('adventure.start', { questId: RIVER_QUEST_ID });
	await second.send('adventure.start', { questId: RIVER_QUEST_ID });
	await perform(first, firstPlayer, 'meet-keeper');
	await perform(first, firstPlayer, 'inspect-west');
	const duplicate = await perform(first, firstPlayer, 'inspect-west');
	assert.equal(errorCode(duplicate), 'RIVER_STEP_ALREADY_RECORDED');
	for (const stepId of ['inspect-center', 'inspect-east']) {
		await perform(first, firstPlayer, stepId);
	}
	for (const stepId of [
		'collect-timber-1', 'collect-timber-2',
		'collect-timber-3', 'collect-timber-4'
	]) {
		await perform(first, firstPlayer, stepId);
	}
	for (const creatureId of ['dybbuk-1', 'dybbuk-2']) {
		const creature = room.creatures.get(creatureId);
		firstPlayer.position = beside(creature.position);
		while (creature.status === 'active') {
			await first.send('combat.attack', {
				creatureId,
				intent: 'defense',
				weaponId: 'wooden-staff'
			});
			now += 701;
		}
	}
	await perform(first, firstPlayer, 'illuminate-portal');
	await perform(first, firstPlayer, 'report-repair');
	for (const player of [firstPlayer, secondPlayer]) {
		const progress = player.adventureQuests[RIVER_QUEST_ID];
		assert.equal(progress.status, 'complete');
		assert.equal(player.wallet.mitzvahCoins, 124);
		assert.equal(player.progression.xp, 220);
		assert.equal(player.progression.mitzvahPoints, 8);
		assert.equal(player.progression.rewardIds.includes(`adventure-reward:${RIVER_QUEST_ID}`), true);
	}
	assert.equal(itemQuantity(firstPlayer, 'treated-timber'), 4);
	assert.equal(itemQuantity(secondPlayer, 'treated-timber'), 0);
	assert.equal(room.worldEffects.snapshot()[0].state, 'lit');
	await harness.platform.disconnect(first.client);
	await harness.platform.disconnect(second.client);
	const restored = createMmorpgHarness(options);
	const resumed = restored.flow('river-resumed');
	await resumed.send('world.join', { resumeToken: firstJoin.payload.session.resumeToken });
	const restoredRoom = restored.directory.rooms.get('main-village');
	assert.equal(restoredRoom.worldEffects.snapshot()[0].id, 'village-stone-bridge:lanterns');
	assert.equal(restoredRoom.worldEffects.snapshot()[0].state, 'lit');
});

async function perform(flow, player, stepId) {
	player.position = { ...RIVER_ACTIONS[stepId].position };
	return flow.send('adventure.step', { questId: RIVER_QUEST_ID, stepId });
}
function beside(position) {
	return { x: position.x + 1, y: position.y, z: position.z };
}
function errorCode(response) {
	return response?.error?.code || response?.payload?.code || response?.code || null;
}
function itemQuantity(player, itemId) {
	return player.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
