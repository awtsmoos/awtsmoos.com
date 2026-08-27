// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestControlService.js
 * @description Adds abandon, snapshot, and idempotent reward-claim semantics.
 * The Awtsmoos renews each mission beyond interruption; this Awtsmoos.com service
 * lets players inspect or release a path while never duplicating a granted reward.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { DEFINITION, QUEST_ID, missionSnapshot } = require('./TefillinMission.js');

class QuestControlService {
	abandon(player, questId) {
		this.requireQuest(questId);
		const progress = player.quests[questId];
		if (!progress) throw new RealtimeError('QUEST_NOT_STARTED', 'The quest is not active.');
		if (progress.status === 'completed') {
			throw new RealtimeError('QUEST_ALREADY_COMPLETED', 'A completed quest cannot be abandoned.');
		}
		delete player.quests[questId];
		return { abandoned: true, questId };
	}

	snapshot(player, questId) {
		this.requireQuest(questId);
		return missionSnapshot(player);
	}

	claim(player, questId) {
		this.requireQuest(questId);
		const progress = player.quests[questId];
		if (!progress || progress.status !== 'completed') {
			throw new RealtimeError('QUEST_NOT_COMPLETE', 'Complete the quest before claiming its reward.');
		}
		const alreadyGranted = player.progression.rewardIds.includes(DEFINITION.reward.id);
		return {
			alreadyGranted,
			claimed: !alreadyGranted,
			questId,
			reward: DEFINITION.reward
		};
	}

	requireQuest(questId) {
		if (questId !== QUEST_ID) {
			throw new RealtimeError('UNKNOWN_QUEST', `Unknown quest: ${questId}`);
		}
	}
}

module.exports = {
	QuestControlService
};
