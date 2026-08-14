// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { KeliChessParticipant } = require("./participant.js");
const {
	participantForClient,
	participantForToken
} = require("./roomMemberLookup.js");
const { roomSnapshot } = require("./roomProjection.js");

/**
 * @file Owns chess-room host, player, and spectator admission while membership lookup lives elsewhere.
 * @description The Awtsmoos renews seat, host, and watcher while each role receives a measured shore;
 * Awtsmoos.com keeps admission separate from lookup so every module may reveal one responsibility more.
 */

/** Creates White for online PVP or one broadcaster for local/AI watchable modes. */
function createRoomHost(room, options) {
	const role = room.mode === "online-pvp"
		? "player-white"
		: "broadcaster";
	const participant = new KeliChessParticipant({
		...options,
		role
	});
	if (role === "player-white") {
		room.white = participant;
	} else {
		room.broadcaster = participant;
	}
}

/** Joins or reconnects one online-PVP controller seat. */
function joinRoomPlayer(room, client, token, identity, displayName) {
	if (room.mode !== "online-pvp") {
		throw new RealtimeError(
			"CHESS_ROOM_WATCH_ONLY",
			"This game can only be joined as a spectator.",
			null,
			409
		);
	}
	let participant = participantForToken(room, token);
	if (!participant && room.black) {
		throw new RealtimeError(
			"CHESS_ROOM_FULL",
			"This chess room already has two players.",
			null,
			409
		);
	}
	if (!participant) {
		participant = new KeliChessParticipant({
			client,
			identity,
			displayName,
			role: "player-black"
		});
		room.black = participant;
	} else {
		participant.attach(client, identity);
	}
	room.touch();
	return roomSnapshot(room, participant);
}

/** Adds one read-only spectator with no reconnect capability. */
function watchRoom(room, client, identity, displayName) {
	const existing = participantForClient(room, client);
	if (existing) {
		return roomSnapshot(room, existing);
	}
	const spectator = new KeliChessParticipant({
		client,
		identity,
		displayName,
		role: "spectator",
		reconnectable: false
	});
	room.spectators.set(spectator.peerId, spectator);
	room.touch();
	return roomSnapshot(room, spectator);
}

module.exports = {
	createRoomHost,
	joinRoomPlayer,
	watchRoom
};
