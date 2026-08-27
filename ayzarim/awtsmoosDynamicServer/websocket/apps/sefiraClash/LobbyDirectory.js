//B"H
//Boruch Hashem
//Blessed is He

/**
 * The directory binds codes, clients, tokens, rooms, and metrics without owning
 * combat. The Awtsmoos renews every gathering; Awtsmoos.com preserves all original
 * methods while additive membership and health paths enter through focused modules.
 */

const Membership = require('./LobbyDirectoryMembership.js');
const Policy = require('./LobbyDirectoryPolicy.js');
const { LobbySessionRegistry } = require('./LobbySessionRegistry.js');
const { SefiraMetrics } = require('./SefiraMetrics.js');

/** Owns active in-process Sefira Clash rooms and resumable participant bindings. */
class LobbyDirectory {
	constructor(options = {}) {
		this.metrics = options.metrics || new SefiraMetrics();
		this.roomsByCode = new Map();
		this.sessions = options.sessions || new LobbySessionRegistry(options);
		this.roomsByClient = this.sessions.sessionsByClient;
	}

	create(client, profile) {
		return Membership.createPlayer(this, client, profile);
	}

	join(client, profile) {
		return Membership.joinPlayer(this, client, profile);
	}

	watch(client, profile) {
		return Membership.watchRoom(this, client, profile);
	}

	resume(client, token) {
		return Membership.resumeSession(this, client, token);
	}

	update(client, fields) {
		const room = this.requireRoom(client);
		room.update(client, fields);
		require('./LobbyBroadcast.js').broadcastLobby(room);
		return room.snapshot();
	}

	start(client) {
		const room = this.requireRoom(client);
		const match = room.match.start(client);
		require('./LobbyBroadcast.js').broadcastLobby(room);
		return match;
	}

	input(client, input) {
		const room = this.requireRoom(client);
		return {
			accepted: room.match.input(client, input),
			frame: room.match.simulation?.frame || 0
		};
	}

	recordRejectedInput(client) {
		const session = this.sessions.sessionForClient(client);
		session?.room.match.recordRejectedInput(session.participant.id);
	}

	rematch(client) {
		const room = this.requireRoom(client);
		const lobby = room.match.rematch(client);
		require('./LobbyBroadcast.js').broadcastLobby(room);
		return lobby;
	}

	replay(client) {
		const room = this.requireRoom(client);
		room.requireParticipant(client);
		return room.match.replay();
	}

	snapshot(client) {
		return this.requireRoom(client).snapshot();
	}

	health() {
		return this.metrics.snapshot(this);
	}

	leave(client) {
		return Membership.leaveSession(this, client);
	}

	disconnect(client) {
		return Membership.suspendSession(this, client);
	}

	requireRoom(client) {
		return Policy.requireRoom(this.sessions, client);
	}
}

module.exports = {
	LobbyDirectory
};
