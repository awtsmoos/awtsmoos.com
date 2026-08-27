//B"H
//Boruch Hashem
//Blessed is He

/**
 * A participant persists beyond one temporary socket while keeping private identity
 * outside every broadcast. The Awtsmoos renews the person and connection separately;
 * Awtsmoos.com exposes only safe presence fields through this foundational vessel.
 */

const { randomUUID } = require('node:crypto');
const { createResumeToken } = require('./SessionToken.js');

/** Provides shared identity and connection lifecycle for players and spectators. */
class LobbyParticipant {
	constructor(client, profile, role) {
		this.client = client;
		this.connected = true;
		this.disconnectedAt = null;
		this.displayName = profile.displayName;
		this.id = randomUUID();
		this.joinedAt = Date.now();
		this.reconnectDeadline = null;
		this.resumeToken = createResumeToken();
		this.role = role;
	}

	/** Binds a replacement socket to the same participant identity. */
	bindClient(client) {
		this.client = client;
		this.connected = true;
		this.disconnectedAt = null;
		this.reconnectDeadline = null;
	}

	/** Detaches transport while retaining identity for a bounded grace period. */
	suspend(graceMs, now = Date.now()) {
		this.client = null;
		this.connected = false;
		this.disconnectedAt = now;
		this.reconnectDeadline = now + graceMs;
	}

	/** Returns safe shared identity fields without client or resume token references. */
	snapshotBase() {
		return {
			connected: this.connected,
			disconnectedAt: this.disconnectedAt,
			displayName: this.displayName,
			id: this.id,
			joinedAt: this.joinedAt,
			reconnectDeadline: this.reconnectDeadline,
			role: this.role
		};
	}
}

module.exports = {
	LobbyParticipant
};
