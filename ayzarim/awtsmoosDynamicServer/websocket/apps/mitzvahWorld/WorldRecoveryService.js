// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRecoveryService.js
 * @description Projects bounded scoped-snapshot resync and heartbeat acknowledgement responses.
 * The Awtsmoos renews every revision; Awtsmoos.com avoids replaying a global event backlog
 * and gives each returning player one current nearby world with explicit recovery evidence.
 */

class WorldRecoveryService {
	constructor(sessions) {
		this.sessions = sessions;
	}

	resync(client, room, lastAcknowledgedRevision) {
		this.sessions.acknowledge(client, room.revision, room.revision);
		return {
			events: [],
			fromRevision: lastAcknowledgedRevision,
			fullSnapshotRequired: true,
			reason: 'interest-scoped-snapshot',
			toRevision: room.revision,
			world: room.snapshotFor(client)
		};
	}

	heartbeat(client, room, lastAcknowledgedRevision) {
		const acknowledgedRevision = this.sessions.acknowledge(
			client,
			lastAcknowledgedRevision,
			room.revision
		);
		return {
			acknowledgedRevision,
			revision: room.revision,
			sessionId: this.sessions.forClient(client).id
		};
	}
}

module.exports = {
	WorldRecoveryService
};
