// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file riverCrossingCoop.test.cjs
 * @description Proves ordered party repair, timed combat, exact rewards, light, and persistence.
 * The Awtsmoos joins two travelers without merging their identities; Awtsmoos.com verifies
 * evidence, facing, unique impacts, personal reward, public bridge light, and restart truth.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');
const {
	RIVER_QUEST_ID,
	createRiverContext,
	errorCode,
	itemQuantity,
	performRiverStep,
	placeFacing,
	staffAttack
} = require('./riverCrossingCoopFixture.cjs');

test('B"H two party members repair the River Crossing with personal exact rewards', {
	timeout: 30000
}, async () => {
	const context = await createRiverContext();
	const {
		clock,
		first,
		firstJoin,
		firstPlayer,
		harness,
		options,
		room,
		second,
		secondPlayer
	} = context;
	let impact = 0;
	await first.send('adventure.start', { questId: RIVER_QUEST_ID });
	await second.send('adventure.start', { questId: RIVER_QUEST_ID });
	await performRiverStep(first, firstPlayer, 'meet-keeper');
	await performRiverStep(first, firstPlayer, 'inspect-west');
	assert.equal(
		errorCode(await performRiverStep(first, firstPlayer, 'inspect-west')),
		'RIVER_STEP_ALREADY_RECORDED'
	);
	for (const stepId of ['inspect-center', 'inspect-east']) {
		await performRiverStep(first, firstPlayer, stepId);
	}
	for (const stepId of timberSteps()) {
		await performRiverStep(first, firstPlayer, stepId);
	}
	for (const creatureId of ['dybbuk-1', 'dybbuk-2']) {
		const creature = room.creatures.get(creatureId);
		placeFacing(firstPlayer, creature.position);
		while (creature.status === 'active') {
			impact += 1;
			const response = await first.send(
				'combat.attack',
				staffAttack(creatureId, impact)
			);
			assert.notEqual(response.type, 'error');
			clock.now += 701;
		}
	}
	await performRiverStep(first, firstPlayer, 'illuminate-portal');
	await performRiverStep(first, firstPlayer, 'report-repair');
	for (const player of [firstPlayer, secondPlayer]) {
		assertPlayerReward(player);
	}
	assert.equal(itemQuantity(firstPlayer, 'treated-timber'), 4);
	assert.equal(itemQuantity(secondPlayer, 'treated-timber'), 0);
	assert.equal(room.worldEffects.snapshot()[0].state, 'lit');
	await harness.platform.disconnect(first.client);
	await harness.platform.disconnect(second.client);
	const restored = createMmorpgHarness(options);
	const resumed = restored.flow('river-resumed');
	await resumed.send('world.join', {
		resumeToken: firstJoin.payload.session.resumeToken
	});
	const effect = restored.directory.rooms
		.get('main-village')
		.worldEffects.snapshot()[0];
	assert.equal(effect.id, 'village-stone-bridge:lanterns');
	assert.equal(effect.state, 'lit');
});

function timberSteps() {
	return [
		'collect-timber-1',
		'collect-timber-2',
		'collect-timber-3',
		'collect-timber-4'
	];
}

function assertPlayerReward(player) {
	const progress = player.adventureQuests[RIVER_QUEST_ID];
	assert.equal(progress.status, 'complete');
	assert.equal(player.wallet.mitzvahCoins, 124);
	assert.equal(player.progression.xp, 220);
	assert.equal(player.progression.mitzvahPoints, 8);
	assert.equal(
		player.progression.rewardIds.includes(`adventure-reward:${RIVER_QUEST_ID}`),
		true
	);
}
