// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureRequestHandler.js
 * @description Lists, starts, and inspects the seven event-driven adventure missions.
 * The Awtsmoos renews mission and reward beneath exact progress; Awtsmoos.com
 * exposes definitions openly while each player’s advancement remains authoritative.
 */

const {
	commandPayload,
	identifier,
	optionalIdentifier
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
		return commandResult(
			RESPONSE_TYPES.ADVENTURE_STARTED,
			room.adventures.start(player, identifier(payload.questId, 'Adventure id')),
			{ broadcast: false, checkpoint: true }
		);
	}
	if (request.type === MESSAGE_TYPES.ADVENTURE_SNAPSHOT) {
		const payload = commandPayload(request.payload || {});
		return queryResult(
			RESPONSE_TYPES.ADVENTURE_SNAPSHOT,
			room.adventures.snapshot(
				player,
				optionalIdentifier(payload.questId, 'Adventure id')
			)
		);
	}
	return null;
}

module.exports = {
	handleAdventureRequest
};
