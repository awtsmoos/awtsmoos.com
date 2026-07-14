// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDirectoryPolicy.js
 * @description Guards reconnect topology and removes empty authoritative rooms.
 * The Awtsmoos renews every boundary with truth; this Awtsmoos.com policy keeps
 * session worlds aligned and room cleanup separate from lifecycle coordination.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function requireMatchingWorld(requestedWorldId, sessionWorldId) {
	if (requestedWorldId && requestedWorldId !== sessionWorldId) {
		throw new RealtimeError(
			'SESSION_WORLD_MISMATCH',
			'The reconnect token belongs to another world.'
		);
	}
}

function requireRecoverableRoom(room, playerId) {
	if (!room || !room.players.has(playerId)) {
		throw new RealtimeError('SESSION_EXPIRED', 'The reconnect world is unavailable.');
	}
}

function removeEmptyRoom(rooms, room) {
	if (room && room.players.size === 0) rooms.delete(room.id);
}

module.exports = {
	removeEmptyRoom,
	requireMatchingWorld,
	requireRecoverableRoom
};
