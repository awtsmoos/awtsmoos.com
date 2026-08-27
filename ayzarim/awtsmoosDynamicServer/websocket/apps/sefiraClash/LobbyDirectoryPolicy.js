//B"H
//Boruch Hashem
//Blessed is He

/**
 * Directory policy bridges the original client-room map and the newer resumable
 * registry without deleting either vessel. The Awtsmoos renews both generations;
 * Awtsmoos.com preserves old lobby callers while allowing private resume identity.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

/** Requires an unbound client through either supported directory generation. */
function requireAvailableClient(registry, client) {
	if (typeof registry.requireAvailable === 'function') {
		registry.requireAvailable(client);
		return;
	}
	if (registry.has(client)) {
		throw new RealtimeError('ALREADY_IN_LOBBY', 'Leave the current lobby first.');
	}
}

/** Resolves a room through either a resumable session registry or legacy map. */
function requireRoom(registry, client) {
	if (typeof registry.requireSession === 'function') {
		return registry.requireSession(client).room;
	}
	const room = registry.get(client);
	if (!room) {
		throw new RealtimeError('NOT_IN_LOBBY', 'Client has no active Sefira lobby.');
	}
	return room;
}

/** Builds the additive private response from a participant or legacy client. */
function sessionResult(room, participantOrClient) {
	const participant = participantOrClient?.role
		? participantOrClient
		: room.requireParticipant(participantOrClient);
	const isPlayer = participant.role === 'player';
	return {
		lobby: room.snapshot(),
		match: currentMatchSnapshot(room),
		participantId: participant.id,
		playerId: isPlayer ? participant.id : null,
		resumeToken: participant.resumeToken,
		role: participant.role
	};
}

/** Reads either match-controller generation without requiring one API shape. */
function currentMatchSnapshot(room) {
	if (typeof room.match.currentSnapshot === 'function') {
		return room.match.currentSnapshot();
	}
	return room.match.simulation?.snapshot() || null;
}

module.exports = {
	requireAvailableClient,
	requireRoom,
	sessionResult
};
