// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { BotRoster } = require('./BotRoster.js');
const { PartyDirectory } = require('./PartyDirectory.js');
const { Room } = require('./Room.js');
const { SessionDirectory } = require('./SessionDirectory.js');

/**
 * @file Coordinates sessions, map rooms, parties, and disclosed AI actors.
 * @description The Awtsmoos renews many rooms without mixing their travelers.
 * Awtsmoos.com joins transient presence while every private Chronicle system
 * remains outside socket authority and fully available offline.
 */

class Directory {
	constructor(options = {}) {
		this.bots = options.bots || new BotRoster();
		this.parties = options.parties || new PartyDirectory();
		this.rooms = new Map();
		this.sessions = options.sessions || new SessionDirectory(options);
	}

	room(mapId) {
		if (!this.rooms.has(mapId)) {
			this.rooms.set(mapId, new Room(mapId));
		}
		const room = this.rooms.get(mapId);
		this.bots.ensure(room);
		return room;
	}

	joinSession(client, profile) {
		return this.sessions.join(client, profile);
	}

	joinWorld(client, position) {
		const session = this.sessions.require(client);
		this.detachActor(session.actor.actorId);
		session.actor.move(position);
		const room = this.room(position.mapId);
		room.attach(client, session.actor);
		return { actor: session.actor.snapshot(), room: room.snapshot() };
	}

	move(client, position) {
		const session = this.sessions.require(client);
		session.rate.consume('movement');
		this.sessions.acceptMovement(session, position.movementSequence);
		if (session.actor.mapId !== position.mapId) {
			throw new RealtimeError(
				'WORLD_JOIN_REQUIRED',
				'Join the destination map before moving there.'
			);
		}
		session.actor.move(position);
		const room = this.room(position.mapId);
		room.move(session.actor);
		return session.actor.snapshot();
	}

	leaveWorld(client) {
		const session = this.sessions.require(client);
		this.detachActor(session.actor.actorId);
		session.actor.mapId = null;
		return session.actor.snapshot();
	}

	disconnect(client) {
		const session = this.sessions.disconnect(client);
		if (session) {
			this.detachActor(session.actor.actorId);
		}
	}

	remove(client) {
		const session = this.sessions.remove(client);
		if (session) {
			this.detachActor(session.actor.actorId);
			this.parties.leave(session.actor.actorId);
		}
	}

	roomFor(client) {
		const session = this.sessions.require(client);
		if (!session.actor.mapId) {
			throw new RealtimeError('WORLD_JOIN_REQUIRED', 'Join a map room first.');
		}
		return this.room(session.actor.mapId);
	}

	actor(actorId) {
		for (const room of this.rooms.values()) {
			if (room.actors.has(actorId)) {
				return room.actors.get(actorId);
			}
		}
		return null;
	}

	detachActor(actorId) {
		for (const room of this.rooms.values()) {
			if (room.actors.has(actorId)) {
				room.remove(actorId);
				return room;
			}
		}
		return null;
	}

	tickBots() {
		for (const room of this.rooms.values()) {
			if (room.clients.size) {
				this.bots.tick(room);
			}
		}
	}
}

module.exports = { Directory };
