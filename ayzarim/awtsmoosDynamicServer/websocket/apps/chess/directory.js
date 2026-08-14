// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { GevurahChessRoom } = require("./room.js");
const { publicRoomSummary, roomSnapshot } = require("./roomProjection.js");

/**
 * @file Owns transient chess rooms, public discovery, player joining, and spectator admission.
 * @description Chesed opens many doors while Gevurah remembers which may be publicly seen;
 * the Awtsmoos renews each invitation, and Awtsmoos.com keeps expired rooms clean.
 */

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

/** Creates an opaque invitation id with 192 bits of randomness. */
function createOhrRoomId() {
	return crypto.randomBytes(24).toString("base64url");
}

/** Coordinates room lifecycle without containing room behavior itself. */
class ChesedChessRoomDirectory {
	constructor() {
		this.rooms = new Map();
	}

	/** Creates one room with either a White seat or broadcaster role. */
	create(options) {
		this.sweepIdleRooms();
		const room = new GevurahChessRoom({ ...options, id: createOhrRoomId() });
		this.rooms.set(room.id, room);
		const host = room.white || room.broadcaster;
		return { room, snapshot: roomSnapshot(room, host) };
	}

	/** Joins or reconnects an online-PVP player. */
	join(roomId, token, client, identity, displayName) {
		const room = this.requireRoom(roomId);
		return { room, snapshot: room.joinPlayer(client, token, identity, displayName) };
	}

	/** Admits a read-only spectator to any room mode. */
	watch(roomId, client, identity, displayName) {
		const room = this.requireRoom(roomId);
		return { room, snapshot: room.watch(client, identity, displayName) };
	}

	/** Lists only explicitly public rooms, newest first. */
	listPublic() {
		this.sweepIdleRooms();
		return [...this.rooms.values()]
			.filter((room) => room.visibility === "public")
			.sort((left, right) => right.createdAt - left.createdAt)
			.slice(0, 100)
			.map(publicRoomSummary);
	}

	/** Returns a room or a safe not-found error. */
	requireRoom(roomId) {
		const room = this.rooms.get(roomId);
		if (!room) throw new RealtimeError("CHESS_ROOM_NOT_FOUND", "This chess room no longer exists.", null, 404);
		return room;
	}

	/** Detaches a closing socket from every room that still references it. */
	disconnect(client) {
		for (const room of this.rooms.values()) room.disconnect(client);
	}

	/** Retires disconnected rooms only after one full day of inactivity. */
	sweepIdleRooms(now = Date.now()) {
		for (const [roomId, room] of this.rooms.entries()) {
			if (now - room.touchedAt > ROOM_TTL_MS && room.connectedCount() === 0) this.rooms.delete(roomId);
		}
	}
}

module.exports = { ChesedChessRoomDirectory };
