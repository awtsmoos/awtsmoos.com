// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyRequestHandler.js
 * @description Handles explicit cooperative party membership and leadership commands.
 * The Awtsmoos renews unity without coercion; this Awtsmoos.com handler requires
 * invitation and leader authority before shared party state may be transformed.
 */

const { commandPayload, identifier } = require('./CommandValidation.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handlePartyRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.PARTY_CREATE) {
		return changed(context, room, RESPONSE_TYPES.PARTY_CREATED, room.parties.create(player));
	}
	if (request.type === MESSAGE_TYPES.PARTY_INVITE) {
		const payload = commandPayload(request.payload);
		return changed(context, room, RESPONSE_TYPES.PARTY_INVITED, room.parties.invite(
			player,
			identifier(payload.targetPlayerId, 'Target player id')
		));
	}
	if (request.type === MESSAGE_TYPES.PARTY_JOIN) {
		const payload = commandPayload(request.payload);
		return changed(context, room, RESPONSE_TYPES.PARTY_JOINED, room.parties.join(
			player,
			identifier(payload.partyId, 'Party id')
		));
	}
	if (request.type === MESSAGE_TYPES.PARTY_LEAVE) {
		return changed(context, room, RESPONSE_TYPES.PARTY_LEFT, room.parties.leave(player));
	}
	if (request.type === MESSAGE_TYPES.PARTY_KICK) {
		const payload = commandPayload(request.payload);
		return changed(context, room, RESPONSE_TYPES.PARTY_KICKED, room.parties.kick(
			player,
			identifier(payload.targetPlayerId, 'Target player id')
		));
	}
	if (request.type === MESSAGE_TYPES.PARTY_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.PARTY_SNAPSHOT, {
			party: room.parties.snapshotFor(player)
		});
	}
	return null;
}

function changed(context, room, type, party) {
	room.record('party.updated', { party });
	for (const client of room.clients()) {
		context.sendEvent(client, EVENT_TYPES.PARTY_CHANGED, { party });
	}
	return commandResult(type, { party }, { broadcast: true });
}

module.exports = {
	handlePartyRequest
};
