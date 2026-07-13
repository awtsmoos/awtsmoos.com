//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Rooms become discoverable through a directory that remembers codes without
 * exposing sockets. The Awtsmoos renews each gathering; Awtsmoos.com removes
 * abandoned vessels and forbids one client from entering two rooms at once.
 */

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { broadcastLobby } = require("./LobbyBroadcast.js");
const { createJoinCode } = require("./joinCode.js");
const { LobbyRoom } = require("./LobbyRoom.js");

/** Owns all active in-process Sefira Clash lobby rooms. */
class LobbyDirectory {
	constructor() {
		this.roomsByCode = new Map();
		this.roomsByClient = new WeakMap();
	}

	/** Creates one room and returns its public state plus owner identity. */
	create(client, profile) {
		this.requireAvailableClient(client);
		const code = createJoinCode(this.roomsByCode);
		const room = new LobbyRoom(code, client, profile);
		this.roomsByCode.set(code, room);
		this.roomsByClient.set(client, room);
		broadcastLobby(room);
		return this.sessionResult(room, client);
	}

	/** Joins one room and returns its public state plus member identity. */
	join(client, profile) {
		this.requireAvailableClient(client);
		const room = this.roomsByCode.get(profile.joinCode);
		if (!room) {
			throw new RealtimeError(
				"LOBBY_NOT_FOUND",
				"No lobby matches that join code."
			);
		}
		room.add(client, profile);
		this.roomsByClient.set(client, room);
		broadcastLobby(room);
		return this.sessionResult(room, client);
	}

	/** Applies validated player fields and broadcasts the new revision. */
	update(client, fields) {
		const room = this.requireRoom(client);
		room.update(client, fields);
		broadcastLobby(room);
		return room.snapshot();
	}

	/** Returns the current public room snapshot for one member. */
	snapshot(client) {
		return this.requireRoom(client).snapshot();
	}

	/** Removes one member, migrates ownership, and retires empty rooms. */
	leave(client) {
		const room = this.roomsByClient.get(client);
		if (!room) {
			return null;
		}
		room.remove(client);
		this.roomsByClient.delete(client);
		if (room.isEmpty()) {
			this.roomsByCode.delete(room.joinCode);
			return null;
		}
		broadcastLobby(room);
		return room.snapshot();
	}

	/** Applies the same room lifecycle when the transport disconnects. */
	disconnect(client) {
		this.leave(client);
	}

	/** Returns public state plus the requesting client's opaque player id. */
	sessionResult(room, client) {
		return {
			lobby: room.snapshot(),
			playerId: room.requireMember(client).id
		};
	}

	requireAvailableClient(client) {
		if (this.roomsByClient.has(client)) {
			throw new RealtimeError(
				"ALREADY_IN_LOBBY",
				"Leave the current lobby first."
			);
		}
	}

	requireRoom(client) {
		const room = this.roomsByClient.get(client);
		if (!room) {
			throw new RealtimeError(
				"NOT_IN_LOBBY",
				"Client has no active Sefira lobby."
			);
		}
		return room;
	}
}

module.exports = {
	LobbyDirectory
};
