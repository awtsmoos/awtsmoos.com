// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Resolves chess-room membership without mixing admission or game-state mutation into the lookup path.
 * @description The Awtsmoos renews every attached vessel while identity is proven by the socket already in sight;
 * Awtsmoos.com keeps lookup separate from admission so no payload may imitate a member's right.
 */

/** Returns every controller and spectator participant. */
function allRoomParticipants(room) {
	return [
		room.white,
		room.black,
		room.broadcaster,
		...room.spectators.values()
	].filter(Boolean);
}

/** Finds current membership by attached socket, never by payload account identity. */
function participantForClient(room, client) {
	return allRoomParticipants(room)
		.find((participant) => participant.clients.has(client)) || null;
}

/** Finds a reconnectable controller seat by its private capability. */
function participantForToken(room, token) {
	return [
		room.white,
		room.black,
		room.broadcaster
	].find((participant) => participant?.matchesToken(token)) || null;
}

/** Requires current socket membership before any room action. */
function requireRoomMember(room, client) {
	const participant = participantForClient(room, client);
	if (!participant) {
		throw new RealtimeError(
			"CHESS_ROOM_MEMBERSHIP_REQUIRED",
			"Join or watch this room first.",
			null,
			403
		);
	}
	return participant;
}

module.exports = {
	allRoomParticipants,
	participantForClient,
	participantForToken,
	requireRoomMember
};
