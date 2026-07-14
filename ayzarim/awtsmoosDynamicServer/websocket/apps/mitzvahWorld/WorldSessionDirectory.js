// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { createSessionRecord } = require('./SessionRecordFactory.js');
const { SessionJoinKeyIndex } = require('./SessionJoinKeyIndex.js');
const { SessionRequestLedger } = require('./SessionRequestLedger.js');
const { SessionTokenService } = require('./SessionTokenService.js');

/**
 * @file Owns reconnect identity, join idempotency, expiry, replay, and credentials.
 * @description The Awtsmoos renews sockets while one private session preserves the
 * verified account relationship. Awtsmoos.com keeps identity out of public world
 * snapshots while reconnect and persistence retain it server-side.
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
	}

	create(client, roomId, playerId, joinKey = null, identity = null) {
		const resolvedIdentity = identity || {
			accountId: `guest:${String(client?.id || 'anonymous')}`,
			assurance: 'guest'
		};
		const session = createSessionRecord({
			client,
			credentials: this.tokens.createCredentials(this.sessions),
			identity: resolvedIdentity,
			joinKey,
			playerId,
			roomId
		});
		this.sessions.set(session.resumeToken, session);
		this.clientTokens.set(client, session.resumeToken);
		this.joinKeys.bind(session);
		return session;
	}

	requireToken(resumeToken) {
		const session = this.sessions.get(resumeToken);
		if (!session || this.isExpired(session)) {
			throw new RealtimeError(
				'SESSION_EXPIRED',
				'The reconnect session is unavailable.'
			);
		}
		return session;
	}

	sessionForJoinKey(joinKey) {
		const token = this.joinKeys.tokenFor(joinKey);
		return token ? this.requireToken(token) : null;
	}

	resume(client, resumeToken) {
		const session = this.requireToken(resumeToken);
		if (session.client && session.client !== client) {
			throw new RealtimeError(
				'SESSION_ACTIVE',
				'The player session is already connected.'
			);
		}
		session.client = client;
		session.expiresAt = null;
		this.clientTokens.set(client, resumeToken);
		return session;
	}

	disconnect(client) {
		const session = this.forClient(client);
		this.clientTokens.delete(client);
		session.client = null;
		session.expiresAt = this.clock() + this.gracePeriodMs;
		return session;
	}

	close(client) {
		const session = this.forClient(client);
		this.clientTokens.delete(client);
		this.sessions.delete(session.resumeToken);
		this.joinKeys.release(session);
		return session;
	}

	forClient(client) {
		const session = this.sessions.get(this.clientTokens.get(client));
		if (!session) {
			throw new RealtimeError(
				'NOT_IN_WORLD',
				'Join a world before issuing this command.'
			);
		}
		return session;
	}

	acknowledge(client, revision, maximumRevision) {
		const session = this.forClient(client);
		if (!Number.isSafeInteger(revision) || revision < 0 || revision > maximumRevision) {
			throw new RealtimeError(
				'INVALID_REVISION',
				'Acknowledged revision is outside the world history.'
			);
		}
		session.lastAcknowledgedRevision = Math.max(
			session.lastAcknowledgedRevision,
			revision
		);
		return session.lastAcknowledgedRevision;
	}

	beginRequest(client, request) {
		return this.forClient(client).ledger.begin(request);
	}

	rememberResponse(client, requestId, fingerprint, result) {
		this.forClient(client).ledger.remember(requestId, fingerprint, result);
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
		return session.expiresAt !== null && session.expiresAt <= this.clock();
	}
}

module.exports = {
	DEFAULT_GRACE_PERIOD_MS,
	WorldSessionDirectory
};
