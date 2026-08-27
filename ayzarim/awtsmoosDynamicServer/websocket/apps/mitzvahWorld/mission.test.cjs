//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createPlayer } = require('./PlayerEntity.js');
const { DEFINITION, advanceTefillinMission, startTefillinMission } = require('./TefillinMission.js');

test('completes the first tefillin mission through three NPCs in order', () => {
	const player = createPlayer({ id: 'player-1', displayName: 'Shliach' });
	startTefillinMission(player);
	for (const objective of DEFINITION.objectives) {
		advanceTefillinMission(player, objective.npcId, objective.action);
	}
	assert.equal(player.quests[DEFINITION.id].status, 'completed');
	assert.equal(player.progression.xp, DEFINITION.reward.xp);
	assert.equal(new Set(DEFINITION.objectives.map(item => item.npcId)).size, 3);
	assert.throws(
		() => advanceTefillinMission(player, 'rabbi-dov-ber', 'report'),
		error => error.code === 'QUEST_ALREADY_COMPLETED'
	);
});

test('rejects an out-of-order or wrong-NPC interaction', () => {
	const player = createPlayer({ id: 'player-2', displayName: 'Learner' });
	startTefillinMission(player);
	assert.throws(
		() => advanceTefillinMission(player, 'daniel-participant', 'assist-tefillin'),
		error => error.code === 'OBJECTIVE_MISMATCH'
	);
});
