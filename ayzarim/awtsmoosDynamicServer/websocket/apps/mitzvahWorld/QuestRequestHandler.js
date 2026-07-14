// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestRequestHandler.js
 * @description Handles quest start, interaction, abandon, snapshot, and reward claim.
 * The Awtsmoos renews every objective without losing order; this Awtsmoos.com
 * handler keeps progress authoritative, recoverable, and resistant to duplicate reward.
 */

const { commandPayload, identifier } = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { validateQuestCommand } = require('./validation.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleQuestRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.QUEST_START) {
		const command = validateQuestCommand(request.payload);
		const mission = room.startQuest(context.client, command.questId);
		return mutation(room, RESPONSE_TYPES.QUEST_STARTED, { mission, world: room.snapshot() });
	}
	if (request.type === MESSAGE_TYPES.QUEST_INTERACT) {
		const mission = room.interact(context.client, validateQuestCommand(request.payload));
		return mutation(room, RESPONSE_TYPES.QUEST_ADVANCED, { mission, world: room.snapshot() });
	}
	if (request.type === MESSAGE_TYPES.QUEST_ABANDON) {
		const payload = commandPayload(request.payload);
		return mutation(room, RESPONSE_TYPES.QUEST_ABANDONED, room.questControl.abandon(
			player,
			identifier(payload.questId, 'Quest id')
		));
	}
	if (request.type === MESSAGE_TYPES.QUEST_SNAPSHOT) {
		const payload = commandPayload(request.payload);
		return queryResult(RESPONSE_TYPES.QUEST_SNAPSHOT, room.questControl.snapshot(
			player,
			identifier(payload.questId, 'Quest id')
		));
	}
	if (request.type === MESSAGE_TYPES.REWARD_CLAIM) {
		const payload = commandPayload(request.payload);
		return queryResult(RESPONSE_TYPES.REWARD_CLAIMED, room.questControl.claim(
			player,
			identifier(payload.questId, 'Quest id')
		));
	}
	return null;
}

function mutation(room, type, payload) {
	room.record('quest.updated', { questId: payload.questId || payload.mission?.definition?.id });
	return commandResult(type, payload, { broadcast: true });
}

module.exports = {
	handleQuestRequest
};
