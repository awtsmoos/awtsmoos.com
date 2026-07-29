// B"H
// Boruch Hashem
// Blessed is He

const { projectWorldJoin } = require('./WorldJoinProjector.js');
const {
	requireMatchingWorld,
	requireRecoverableRoom
} = require('./WorldDirectoryPolicy.js');

/**
 * @file Creates or resumes one Mitzvah World player with private identity and moderator binding.
 * @description The Awtsmoos renews arrival without multiplying the traveler.
 * Awtsmoos.com resolves verified identity only from injected providers, guards reconnect
 * compatibility, reapplies trusted moderator policy, and preserves guest recovery unchanged.
 */

class WorldJoinService {
	constructor(directory) {
		this.directory = directory;
	}

	join(client, profile) {
		this.directory.cleanupExpired();
		const identity = this.directory.identities.resolve(client);
		if (profile.resumeToken) {
			return this.resumeSession(
				client,
				profile,
				this.directory.sessions.requireToken(profile.resumeToken),
				identity
			);
		}
		const keyedSession = this.directory.sessions.sessionForJoinKey(profile.joinKey);
		if (keyedSession) {
			return this.resumeSession(client, profile, keyedSession, identity);
		}
		if (this.directory.clientRooms.has(client)) {
			this.directory.leave(client);
		}
		const room = this.directory.room(profile.worldId);
		const player = room.join(client, profile);
		this.directory.moderators.apply(player, identity, client);
		const session = this.directory.sessions.create(
			client,
			room.id,
			player.id,
			profile.joinKey,
			identity
		);
		this.directory.clientRooms.set(client, room.id);
		return projectWorldJoin(
			this.directory.sessions,
			player,
			room,
			session,
			false
		);
	}

	resumeSession(client, profile, candidate, identity) {
		this.directory.identities.requireCompatible(candidate, identity);
		requireMatchingWorld(profile.worldId, candidate.roomId);
		const room = this.directory.rooms.get(candidate.roomId);
		requireRecoverableRoom(room, candidate.playerId);
		const alreadyAttached = candidate.client === client;
		const session = alreadyAttached
			? candidate
			: this.directory.sessions.resume(client, candidate.resumeToken);
		const player = alreadyAttached
			? room.players.get(session.playerId)
			: room.attach(client, session.playerId);
		this.directory.moderators.apply(player, identity, client);
		this.directory.clientRooms.set(client, room.id);
		if (profile.lastAcknowledgedRevision !== null) {
			this.directory.sessions.acknowledge(
				client,
				profile.lastAcknowledgedRevision,
				room.revision
			);
		}
		return projectWorldJoin(
			this.directory.sessions,
			player,
			room,
			session,
			true
		);
	}
}

module.exports = { WorldJoinService };
