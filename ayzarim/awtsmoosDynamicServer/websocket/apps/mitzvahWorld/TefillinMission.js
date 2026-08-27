//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TefillinMission.js
 * @description The first respectful shlichus mission: preparation, partnership,
 * consent, assistance, and return. Three NPCs reveal one ordered path of service.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { grantReward } = require('./Progression.js');
const QUEST_ID = 'first-tefillin-shlichus';

const NPCS = Object.freeze([
	Object.freeze({ id: 'rabbi-dov-ber', name: 'Rabbi Dov Ber', role: 'mentor', position: { x: 4, y: 0, z: 2 } }),
	Object.freeze({ id: 'levi-outreach-partner', name: 'Levi', role: 'outreach-partner', position: { x: 14, y: 0, z: -8 } }),
	Object.freeze({ id: 'daniel-participant', name: 'Daniel', role: 'participant', position: { x: 28, y: 0, z: -18 } })
]);

const OBJECTIVES = Object.freeze([
	objective('receive-briefing', 'rabbi-dov-ber', 'speak', 'Receive the mission briefing.'),
	objective('collect-tefillin-kit', 'rabbi-dov-ber', 'receive-kit', 'Collect the checked tefillin kit.'),
	objective('meet-outreach-partner', 'levi-outreach-partner', 'speak', 'Meet Levi and review respectful outreach.'),
	objective('request-participation', 'daniel-participant', 'request-consent', 'Invite Daniel and wait for consent.'),
	objective('assist-with-tefillin', 'daniel-participant', 'assist-tefillin', 'Assist Daniel after consent.'),
	objective('report-mission', 'rabbi-dov-ber', 'report', 'Return and report the completed shlichus.')
]);

const DEFINITION = Object.freeze({
	description: 'Go with preparation and respect to help one willing person put on tefillin.',
	id: QUEST_ID,
	npcs: NPCS,
	objectives: OBJECTIVES,
	reward: Object.freeze({ id: 'reward:first-tefillin-shlichus', mitzvahPoints: 18, xp: 180 }),
	title: 'The First Tefillin Shlichus'
});

function startTefillinMission(player) {
	if (!player.quests[QUEST_ID]) {
		player.quests[QUEST_ID] = { completedObjectiveIds: [], objectiveIndex: 0, status: 'active' };
	}
	return missionSnapshot(player);
}

function advanceTefillinMission(player, npcId, action) {
	const progress = player.quests[QUEST_ID];
	if (!progress) throw new RealtimeError('QUEST_NOT_STARTED', 'Start the mission before interacting.');
	if (progress.status === 'completed') throw new RealtimeError('QUEST_ALREADY_COMPLETED', 'Mission is already complete.');
	const expected = OBJECTIVES[progress.objectiveIndex];
	if (expected.npcId !== npcId || expected.action !== action) {
		throw new RealtimeError('OBJECTIVE_MISMATCH', 'That interaction does not satisfy the current objective.', {
			expectedAction: expected.action,
			expectedNpcId: expected.npcId
		});
	}
	progress.completedObjectiveIds.push(expected.id);
	progress.objectiveIndex += 1;
	if (progress.objectiveIndex === OBJECTIVES.length) {
		progress.status = 'completed';
		grantReward(player.progression, DEFINITION.reward);
	}
	return missionSnapshot(player);
}

function missionSnapshot(player) {
	return JSON.parse(JSON.stringify({ definition: DEFINITION, progress: player.quests[QUEST_ID] }));
}

function objective(id, npcId, action, description) {
	return Object.freeze({ action, description, id, npcId });
}

module.exports = {
	DEFINITION,
	NPCS,
	QUEST_ID,
	advanceTefillinMission,
	missionSnapshot,
	startTefillinMission
};
