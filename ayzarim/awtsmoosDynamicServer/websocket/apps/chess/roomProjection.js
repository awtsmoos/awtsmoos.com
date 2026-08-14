// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects private chess-room state into public summaries and member snapshots.
 * @description The Awtsmoos renews hidden and revealed without confusing their place;
 * Awtsmoos.com shows spectators the game while reconnect secrets remain behind the face.
 */

/** Returns presentation-safe room metadata for public discovery. */
function publicRoomSummary(room) {
	return {
		roomId: room.id,
		mode: room.mode,
		visibility: room.visibility,
		title: room.title,
		ready: room.isReady(),
		result: room.result,
		viewerCount: room.spectators.size,
		createdAt: room.createdAt
	};
}

/** Returns every attached role without private account ids or reconnect tokens. */
function roomPresence(room) {
	return room.allParticipants()
		.filter((participant) => participant.clients.size > 0)
		.map((participant) => participant.publicView());
}

/** Returns a reconnect/watch snapshot scoped to the requesting participant. */
function roomSnapshot(room, participant) {
	const side = participant.role === "player-white"
		? "white"
		: participant.role === "player-black" ? "black" : null;
	return {
		...publicRoomSummary(room),
		peerId: participant.peerId,
		role: participant.role,
		side,
		playerToken: participant.token || "",
		history: clone(room.history),
		chatHistory: room.chat.history(),
		presence: roomPresence(room)
	};
}

/** Creates a detached JSON-safe value for network projection. */
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	publicRoomSummary,
	roomPresence,
	roomSnapshot
};
