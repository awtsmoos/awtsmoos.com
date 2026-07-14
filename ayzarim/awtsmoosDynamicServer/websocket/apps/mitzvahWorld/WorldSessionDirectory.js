// B"H
// Boruch Hashem
// Blessed is He

const { SessionJoinKeyIndex } = require('./SessionJoinKeyIndex.js');
const { SessionTokenService } = require('./SessionTokenService.js');
const { WorldSessionLifecycle } = require('./WorldSessionLifecycle.js');
const { WorldSessionRequestState } = require('./WorldSessionRequestState.js');

/**
 * @file Coordinates Mitzvah World session lifecycle, replay, expiry, and credentials.
 * @description The Awtsmoos renews socket, identity, request, and acknowledgement
 * through separate inspectable vessels. Awtsmoos.com keeps private reconnect truth
 * durable while every public projection remains free of account credentials.
 */

const DEFAULT_GRACE_PERIOD_MS = 30_000;

class WorldSessionDirectory {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.gracePeriodMs = options.gracePeriodMs ?? DEFAULT_GRACE_PERIOD_MS;
		this.tokens = new SessionTokenService(options);
		this.joinKeys = new SessionJoinKeyIndex();
		this.sessions = new Map();
		this.clientTokens = new Map();
		this.lifecycle = new WorldSessionLifecycle(this);
		this.requests = new WorldSessionRequestState(this);
	}

	create(client, roomId, playerId, joinKey = null, identity = null) {
		return this.lifecycle.create(
			client,
			roomId,
			playerId,
			joinKey,
			identity
		);
	}

	requireToken(resumeToken) {
		return this.lifecycle.requireToken(resumeToken);
	}

	sessionForJoinKey(joinKey) {
		const token = this.joinKeys.tokenFor(joinKey);
		return token ? this.requireToken(token) : null;
	}

	resume(client, resumeToken) {
		return this.lifecycle.resume(client, resumeToken);
	}

	disconnect(client) {
		return this.lifecycle.disconnect(client);
	}

	close(client) {
		return this.lifecycle.close(client);
	}

	forClient(client) {
		return this.lifecycle.forClient(client);
	}

	acknowledge(client, revision, maximumRevision) {
		return this.requests.acknowledge(
			client,
			revision,
			maximumRevision
		);
	}

	beginRequest(client, request) {
		return this.requests.begin(client, request);
	}

	rememberResponse(client, requestId, fingerprint, result) {
		this.requests.remember(
			client,
			requestId,
			fingerprint,
			result
		);
	}

	credentials(session) {
		return {
			gracePeriodMs: this.gracePeriodMs,
			id: session.id,
			resumeToken: session.resumeToken
		};
	}

	cleanupExpired(removePlayer) {
		for (const [token, session] of this.sessions) {
			if (!this.isExpired(session)) continue;
			this.sessions.delete(token);
			this.joinKeys.release(session);
			removePlayer(session);
		}
	}

	isExpired(session) {
		return session.expiresAt !== null &&
			session.expiresAt <= this.clock();
	}
}

module.exports = {
	DEFAULT_GRACE_PERIOD_MS,
	WorldSessionDirectory
};
