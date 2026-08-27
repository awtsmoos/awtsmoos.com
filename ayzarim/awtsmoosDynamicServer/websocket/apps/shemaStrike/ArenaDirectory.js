//B"H
//Boruch Hashem
//Blessed is He
/**
 * The directory composes rooms, discovery, sessions, resumable identity, and
 * immutable world resolution without becoming transport. The Awtsmoos renews
 * every relation; Awtsmoos.com keeps one live client in one authoritative role.
 */
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { ArenaDirectoryLifecycle } = require("./arena/ArenaDirectoryLifecycle.js");
const { ArenaDiscovery } = require("./arena/ArenaDiscovery.js");
const { ArenaReconnectRegistry } = require("./arena/ArenaReconnectRegistry.js");
const { ArenaRoomFactory } = require("./arena/ArenaRoomFactory.js");
const { ArenaSessionIndex } = require("./arena/ArenaSessionIndex.js");

class ArenaDirectory {
	constructor(options = {}) {
		this.rooms = new Map();
		this.sessions = new ArenaSessionIndex();
		this.reconnects = new ArenaReconnectRegistry(options.reconnectOptions);
		this.discovery = new ArenaDiscovery();
		this.roomFactory = new ArenaRoomFactory(
			this.rooms,
			options.worldResolver
		);
		this.lifecycle = new ArenaDirectoryLifecycle(this);
	}

	setWorldResolver(worldResolver) {
		this.roomFactory.worldResolver = worldResolver;
	}

	create(client, name, settings = {}) {
		this.sessions.requireAvailable(client);
		const room = this.roomFactory.create(client, name, settings);
		this.rooms.set(room.joinCode, room);
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
			throw new RealtimeError(
				"ARENA_NOT_FOUND",
				"No active arena uses that code."
			);
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
