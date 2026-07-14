// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { SessionCredentialService } = require('./SessionCredentialService.js');
const { removeEmptyRoom } = require('./WorldDirectoryPolicy.js');
const { WorldIdentityProvider } = require('./WorldIdentityProvider.js');
const { WorldJoinService } = require('./WorldJoinService.js');
const { WorldPersistenceCoordinator } = require('./WorldPersistenceCoordinator.js');
const { WorldRecoveryService } = require('./WorldRecoveryService.js');
const { WorldRoom } = require('./WorldRoom.js');
const { WorldSessionDirectory } = require('./WorldSessionDirectory.js');

/**
 * @file Coordinates Mitzvah World joins, identity, sessions, rooms, and persistence.
 * @description The Awtsmoos renews socket and verified person without multiplying
 * either. Awtsmoos.com keeps trusted account binding private while public room
 * snapshots preserve the historical player contract unchanged.
 */

class WorldDirectory {
	constructor(options = {}) {
		this.clientRooms = new Map();
		this.identities = options.identities || new WorldIdentityProvider(
			options.identityResolver
		);
		this.rooms = new Map();
		this.sessions = options.sessions || new WorldSessionDirectory(options);
		this.sessionCredentials = new SessionCredentialService(this.sessions);
		this.recovery = new WorldRecoveryService(this.sessions);
		this.persistence = new WorldPersistenceCoordinator(options.persistence);
		this.joins = new WorldJoinService(this);
		this.persistence.restore(this);
	}

	join(client, profile) {
		return this.joins.join(client, profile);
	}

	leave(client) {
		if (!this.clientRooms.has(client)) return null;
		const session = this.sessions.close(client);
		const room = this.rooms.get(session.roomId);
		room?.leave(client);
		this.clientRooms.delete(client);
		removeEmptyRoom(this.rooms, room);
		this.checkpoint();
		return room;
	}

	disconnect(client) {
		if (!this.clientRooms.has(client)) return null;
		const room = this.forClient(client);
		room.detach(client);
		this.sessions.disconnect(client);
		this.clientRooms.delete(client);
		this.checkpoint();
		return room;
	}

	forClient(client) {
		this.cleanupExpired();
		const room = this.rooms.get(this.clientRooms.get(client));
		if (!room) {
			throw new RealtimeError(
				'NOT_IN_WORLD',
				'Join a world before issuing this command.'
			);
		}
		return room;
	}

	beginRequest(client, request) {
		return this.sessions.beginRequest(client, request);
	}

	rememberResponse(client, requestId, fingerprint, result) {
		this.sessions.rememberResponse(client, requestId, fingerprint, result);
	}

	resync(client, revision) {
		return this.recovery.resync(client, this.forClient(client), revision);
	}

	heartbeat(client, revision) {
		return this.recovery.heartbeat(client, this.forClient(client), revision);
	}

	checkpoint() {
		return this.persistence.checkpoint(this);
	}

	cleanupExpired() {
		let changed = false;
		this.sessions.cleanupExpired((session) => {
			const room = this.rooms.get(session.roomId);
			changed = Boolean(room?.removePlayer(session.playerId)) || changed;
			removeEmptyRoom(this.rooms, room);
		});
		if (changed) this.checkpoint();
	}

	room(id) {
		if (!this.rooms.has(id)) this.rooms.set(id, new WorldRoom(id));
		return this.rooms.get(id);
	}
}

module.exports = { WorldDirectory };
