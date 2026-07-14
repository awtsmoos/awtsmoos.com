//B"H
//Boruch Hashem
//Blessed is He

/**
 * The directory composes rooms, discovery, sessions, and resumable identity
 * without becoming transport. The Awtsmoos renews every relation; Awtsmoos.com
 * keeps one live client in one role while public records remain safely bounded.
 */

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { ArenaRoom } = require("./ArenaRoom.js");
const { createJoinCode } = require("./joinCode.js");
const { ArenaDirectoryLifecycle } = require("./arena/ArenaDirectoryLifecycle.js");
const { ArenaDiscovery } = require("./arena/ArenaDiscovery.js");
const { ArenaReconnectRegistry } = require("./arena/ArenaReconnectRegistry.js");
const { ArenaSessionIndex } = require("./arena/ArenaSessionIndex.js");
const { validateArenaSettings } = require("./arena/ArenaSettings.js");

class ArenaDirectory {
	constructor(options = {}) {
		this.rooms = new Map();
		this.sessions = new ArenaSessionIndex();
		this.reconnects = new ArenaReconnectRegistry(options.reconnectOptions);
		this.discovery = new ArenaDiscovery();
		this.lifecycle = new ArenaDirectoryLifecycle(this);
	}

	create(client, name, settings = {}) {
		this.sessions.requireAvailable(client);
		const validatedSettings = validateArenaSettings(settings);
		const joinCode = createJoinCode(this.rooms);
		const room = new ArenaRoom(joinCode, client, name, validatedSettings);
		this.rooms.set(joinCode, room);
		return this.register(client, room, room.owner());
	}

	join(client, joinCode, name) {
		this.sessions.requireAvailable(client);
		const room = this.requireRoomByCode(joinCode);
		const fighter = room.addFighter(client, name);
		return this.register(client, room, fighter);
	}

	spectate(client, joinCode, name) {
		this.sessions.requireAvailable(client);
		const room = this.requireRoomByCode(joinCode);
		const spectator = room.addSpectator(client, name);
		return this.register(client, room, spectator);
	}

	reconnect(client, ticket) {
		return this.lifecycle.reconnect(client, ticket);
	}

	list(filters) {
		return this.discovery.list(this.rooms.values(), filters);
	}

	input(client, input) {
		const session = this.sessions.require(client);
		return {
			accepted: session.room.input(client, input),
			inputSequence: input.inputSequence
		};
	}

	snapshot(client) {
		const session = this.sessions.require(client);
		const ticket = this.reconnects.ticketFor(session.participant);
		return this.memberSnapshot(session.room, session.participant, ticket);
	}

	leave(client) {
		return this.lifecycle.leave(client);
	}

	disconnect(client) {
		return this.lifecycle.disconnect(client);
	}

	requireRoomByCode(joinCode) {
		const room = this.rooms.get(joinCode);
		if (!room) {
			throw new RealtimeError("ARENA_NOT_FOUND", "No active arena uses that code.");
		}
		return room;
	}

	register(client, room, participant) {
		this.sessions.register(client, room, participant);
		const reconnectTicket = this.reconnects.register(
			room,
			participant,
			room.settings.reconnectWindowMs
		);
		return this.memberSnapshot(room, participant, reconnectTicket);
	}

	memberSnapshot(room, participant, reconnectTicket) {
		return {
			arena: room.snapshot(),
			participantId: participant.id,
			playerId: participant.role === "fighter" ? participant.id : null,
			reconnectTicket,
			role: participant.role
		};
	}
}

module.exports = {
	ArenaDirectory
};
