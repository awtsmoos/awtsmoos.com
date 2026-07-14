//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative directory owns active rooms and delegates resumable membership without
 * owning simulation internals. The Awtsmoos renews every shared road; Awtsmoos.com
 * exposes explicit create, join, ready, start, input, snapshot, rematch, and leave law.
 */

const Membership = require('./CoopDirectoryMembership.js');
const { CoopSessionRegistry } = require('./CoopSessionRegistry.js');
const { SefiraMetrics } = require('./SefiraMetrics.js');

class CoopDirectory {
	constructor(options = {}) {
		this.metrics = options.metrics || new SefiraMetrics();
		this.roomsByCode = new Map();
		this.sessions = options.sessions || new CoopSessionRegistry(options);
	}

	create(client, payload) {
		return Membership.createCoopRoom(this, client, payload);
	}

	join(client, payload) {
		return Membership.joinCoopRoom(this, client, payload);
	}

	resume(client, payload) {
		return Membership.resumeCoopRoom(this, client, payload);
	}

	update(client, fields) {
		const session = this.sessions.require(client);
		return session.room.update(session.player, fields);
	}

	start(client) {
		const session = this.sessions.require(client);
		return session.room.start(session.player);
	}

	input(client, payload) {
		const session = this.sessions.require(client);
		return {
			accepted: session.room.input(session.player, payload),
			frame: session.room.simulation?.frame || 0
		};
	}

	snapshot(client) {
		const session = this.sessions.require(client);
		return session.room.snapshot();
	}

	rematch(client) {
		const session = this.sessions.require(client);
		return session.room.rematch(session.player);
	}

	leave(client) {
		return Membership.leaveCoopRoom(this, client);
	}

	disconnect(client) {
		return Membership.disconnectCoopRoom(this, client);
	}

	health() {
		const rooms = [...this.roomsByCode.values()];
		return {
			rooms: rooms.length,
			activeRuns: rooms.filter(room => room.simulation?.phase === 'active').length,
			completedRuns: rooms.filter(room => room.simulation?.phase === 'completed').length,
			connectedPlayers: rooms.flatMap(room => room.players).filter(player => player.connected)
				.length
		};
	}
}

module.exports = {
	CoopDirectory
};
