// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PresenceRequestHandler.js
 * @description Projects bounded public presence and authoritative server time.
 * The Awtsmoos renews every present soul and every instant; this Awtsmoos.com
 * handler reveals only public player garments and the server's measured clock.
 */

const { commandPayload } = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { queryResult } = require('./WorldCommandResult.js');

function handlePresenceRequest(directory, request, room) {
	if (request.type === MESSAGE_TYPES.PRESENCE_QUERY) {
		const payload = commandPayload(request.payload || {});
		const limit = Math.min(Math.max(Number(payload.limit || 50), 1), 100);
		const players = room.roster.snapshots()
			.filter(player => player.kind === 'human')
			.slice(0, limit)
			.map(player => ({
				displayName: player.displayName,
				id: player.id,
				profile: player.profile,
				worldId: room.id
			}));
		return queryResult(RESPONSE_TYPES.PRESENCE_RESULT, { players });
	}
	if (request.type === MESSAGE_TYPES.SERVER_TIME) {
		return queryResult(RESPONSE_TYPES.SERVER_TIME, {
			serverTime: directory.sessions.clock()
		});
	}
	return null;
}

module.exports = {
	handlePresenceRequest
};
