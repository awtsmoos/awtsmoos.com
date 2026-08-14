// B"H
// Boruch Hashem
// Blessed is He

const {
	EVENTS,
	MODES,
	TYPES,
	VISIBILITIES,
	boundedText,
	oneOf,
	playerToken,
	roomId
} = require("./protocol.js");
const { broadcastRoom } = require("./roomBroadcaster.js");
const { roomPresence } = require("./roomProjection.js");

/**
 * @file Routes chess-room creation, joining, watching, and public discovery.
 * @description Chesed opens each room while Gevurah keeps every role named in light;
 * the Awtsmoos renews host and watcher, and Awtsmoos.com keeps admission boundaries right.
 */

/** Handles room-lifecycle requests and leaves game/social/history requests untouched. */
async function handleChessRoomRequest(directory, recorder, context, request) {
	if (request.type === TYPES.CREATE) {
		return createRoom(directory, recorder, context, request.payload);
	}
	if (request.type === TYPES.JOIN) {
		return joinRoom(directory, recorder, context, request.payload);
	}
	if (request.type === TYPES.WATCH) {
		return watchRoom(directory, recorder, context, request.payload);
	}
	if (request.type === TYPES.LIST) {
		return {
			type: "chess.room.listed",
			payload: { rooms: directory.listPublic() }
		};
	}
	return null;
}

/** Creates online PVP or a watchable local/AI broadcast room. */
async function createRoom(directory, recorder, context, payload) {
	const mode = oneOf(payload.mode || "online-pvp", MODES, "Chess mode");
	const visibility = oneOf(payload.visibility || "unlisted", VISIBILITIES, "Room visibility");
	const displayName = boundedText(payload.displayName, "Display name", 48);
	const title = boundedText(payload.title, "Room title", 80, `${displayName || "Chess"} game`);
	const { room, snapshot } = directory.create({
		client: context.client,
		identity: context.identity,
		displayName,
		mode,
		visibility,
		title
	});
	await recorder.join(room.requireMember(context.client), room, "game.created");
	return {
		type: "chess.room.created",
		payload: snapshot
	};
}

/** Claims or reclaims the remaining online-PVP controller seat. */
async function joinRoom(directory, recorder, context, payload) {
	const id = roomId(payload.roomId);
	const token = playerToken(payload.playerToken);
	const displayName = boundedText(payload.displayName, "Display name", 48);
	const { room, snapshot } = directory.join(id, token, context.client, context.identity, displayName);
	const participant = room.requireMember(context.client);
	await recorder.join(participant, room, "game.joined");
	if (room.isReady()) {
		broadcastRoom(context, room, EVENTS.READY, { roomId: room.id });
	}
	broadcastPresence(context, room);
	return {
		type: "chess.room.joined",
		payload: snapshot
	};
}

/** Adds one read-only spectator to any room mode. */
async function watchRoom(directory, recorder, context, payload) {
	const id = roomId(payload.roomId);
	const displayName = boundedText(payload.displayName, "Display name", 48);
	const { room, snapshot } = directory.watch(id, context.client, context.identity, displayName);
	await recorder.join(room.requireMember(context.client), room, "game.watched");
	broadcastPresence(context, room);
	return {
		type: "chess.room.watched",
		payload: snapshot
	};
}

/** Broadcasts presentation-safe presence without account ids or reconnect capabilities. */
function broadcastPresence(context, room) {
	broadcastRoom(context, room, EVENTS.PRESENCE, {
		roomId: room.id,
		presence: roomPresence(room)
	});
}

module.exports = {
	handleChessRoomRequest
};
