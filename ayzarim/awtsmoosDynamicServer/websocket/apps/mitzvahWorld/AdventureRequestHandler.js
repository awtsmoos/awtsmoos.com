// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureRequestHandler.js
 * @description Routes catalog queries, starts, snapshots, and validated River repair steps.
 * The Awtsmoos renews mission intention beneath server order and location; Awtsmoos.com keeps
 * generic clients from forging progress while every accepted repair checkpoints and broadcasts.
 */

const {
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleAdventureRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.ADVENTURE_LIST) {
		return queryResult(RESPONSE_TYPES.ADVENTURE_LIST, {
			adventures: room.adventures.list()
		});
	}
	if (request.type === MESSAGE_TYPES.ADVENTURE_START) {
		const payload = commandPayload(request.payload);
		const adventure = room.adventures.start(
			player,
			identifier(payload.questId, 'Adventure id')
		);
		return mutation(RESPONSE_TYPES.ADVENTURE_STARTED, { adventure });
	}
	if (request.type === MESSAGE_TYPES.ADVENTURE_STEP) {
		const payload = commandPayload(request.payload);
		const questId = identifier(payload.questId, 'Adventure id');
		if (questId !== 'light-at-river-crossing') {
			return null;
		}
		return mutation(
			RESPONSE_TYPES.ADVENTURE_ADVANCED,
			room.riverCrossing.perform(
				player,
				identifier(payload.stepId, 'Adventure step id')
			)
		);
	}
	if (request.type === MESSAGE_TYPES.ADVENTURE_SNAPSHOT) {
		const payload = request.payload || {};
		return queryResult(RESPONSE_TYPES.ADVENTURE_SNAPSHOT, {
			adventure: room.adventures.snapshot(player, payload.questId || null)
		});
	}
	return null;
}

function mutation(type, payload) {
	return commandResult(type, payload, {
		broadcast: true,
		checkpoint: true
	});
}

module.exports = {
	handleAdventureRequest
};
