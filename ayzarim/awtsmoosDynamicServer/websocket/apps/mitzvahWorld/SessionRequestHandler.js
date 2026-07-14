// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionRequestHandler.js
 * @description Handles explicit bearer-token rotation and complete session revocation.
 * The Awtsmoos renews the secret garment without confusing it with the player;
 * Awtsmoos.com lets its owner rotate or revoke that garment through stable commands.
 */

const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult } = require('./WorldCommandResult.js');

function handleSessionRequest(directory, context, request, room) {
	if (request.type === MESSAGE_TYPES.SESSION_ROTATE) {
		const session = directory.sessionCredentials.rotate(context.client);
		return commandResult(RESPONSE_TYPES.SESSION_ROTATED, { session }, {
			broadcast: false,
			checkpoint: true
		});
	}
	if (request.type === MESSAGE_TYPES.SESSION_REVOKE) {
		const session = directory.sessions.forClient(context.client);
		const payload = {
			playerId: session.playerId,
			revoked: true,
			sessionId: session.id
		};
		directory.leave(context.client);
		return commandResult(RESPONSE_TYPES.SESSION_REVOKED, payload, {
			broadcast: false,
			checkpoint: false
		});
	}
	return null;
}

module.exports = {
	handleSessionRequest
};
