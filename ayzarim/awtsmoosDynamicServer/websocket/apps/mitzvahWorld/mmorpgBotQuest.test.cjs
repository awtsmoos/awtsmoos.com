// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgBotQuest.test.cjs
 * @description Proves commanded bots and complete quest-control lifecycle.
 * The Awtsmoos renews helper and mission beneath ordered law; Awtsmoos.com
 * verifies movement, removal, abandonment, snapshots, and exact-once reward truth.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { QUEST_ID } = require('./TefillinMission.js');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

const OBJECTIVES = [
	['rabbi-dov-ber', 'speak'],
	['rabbi-dov-ber', 'receive-kit'],
	['levi-outreach-partner', 'speak'],
	['daniel-participant', 'request-consent'],
	['daniel-participant', 'assist-tefillin'],
	['rabbi-dov-ber', 'report']
];

test('bots accept bounded travel and social commands before removal', async () => {
	const harness = createMmorpgHarness();
	const player = harness.flow('bot-owner');
	await player.join('Bot Owner');
	const spawned = await player.send('bot.spawn', {
		count: 1,
		displayName: 'Helper Bot',
		seed: 613
	});
	const botId = spawned.payload.bots[0].id;
	const travel = await player.send('bot.command', {
		botId,
		command: 'travel',
		x: 10,
		z: 4
	});
	assert.equal(travel.payload.brain.command.type, 'travel');
	await player.send('bot.tick', { steps: 10 });
	const speak = await player.send('bot.command', {
		botId,
		command: 'speak',
		text: 'Ready for shlichus'
	});
	assert.equal(speak.payload.bot.lastAction, 'Ready for shlichus');
	const removed = await player.send('bot.remove', { botId });
	assert.equal(removed.payload.removed, true);
});

test('quest can be inspected abandoned restarted completed and claimed once', async () => {
	const harness = createMmorpgHarness();
	const player = harness.flow('quest-player');
	await player.join('Quest Shliach');
	await player.send('quest.start', { questId: QUEST_ID });
	const snapshot = await player.send('quest.snapshot', { questId: QUEST_ID });
	assert.equal(snapshot.payload.progress.status, 'active');
	const abandoned = await player.send('quest.abandon', { questId: QUEST_ID });
	assert.equal(abandoned.payload.abandoned, true);
	await player.send('quest.start', { questId: QUEST_ID });

	for (const [npcId, action] of OBJECTIVES) {
		await player.send('quest.interact', { action, npcId, questId: QUEST_ID });
	}
	const claimed = await player.send('reward.claim', { questId: QUEST_ID });
	assert.equal(claimed.payload.alreadyGranted, true);
	assert.equal(claimed.payload.claimed, false);
	const room = harness.directory.rooms.get('main-village');
	const authoritative = [...room.players.values()].find(item => item.kind === 'human');
	assert.equal(authoritative.progression.rewardIds.length, 1);
	assert.equal(authoritative.progression.xp, 180);
});
