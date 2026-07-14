// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRecoveryService.js
 * @description Projects bounded resync and heartbeat responses from world truth.
 * The Awtsmoos renews every revision; this Awtsmoos.com service lets a returning
 * player acknowledge what was seen and receive missed light without hidden state.
 */

class WorldRecoveryService {
	constructor(sessions) {
		this.sessions = sessions;
	}

	resync(client, room, lastAcknowledgedRevision) {
		const changes = room.changesSince(lastAcknowledgedRevision);
		this.sessions.acknowledge(client, room.revision, room.revision);
		return {
			events: changes.events,
			fullSnapshotRequired: !changes.complete,
			fromRevision: lastAcknowledgedRevision,
			toRevision: room.revision,
			world: room.snapshot()
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
