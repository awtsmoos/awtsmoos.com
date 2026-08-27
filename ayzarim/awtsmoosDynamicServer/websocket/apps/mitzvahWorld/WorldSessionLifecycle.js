// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { createSessionRecord } = require('./SessionRecordFactory.js');

/**
 * @file Owns Mitzvah World session creation, attachment, leases, and closure.
 * @description The Awtsmoos renews socket garments around one private identity.
 * Awtsmoos.com keeps lifecycle mechanics separate from request replay so neither
 * vessel swells large enough to conceal reconnect or account-binding truth.
 */

function sessionError(code, message) {
	return new RealtimeError(code, message);
}

class WorldSessionLifecycle {
	constructor(directory) {
		this.directory = directory;
	}

	create(client, roomId, playerId, joinKey, identity) {
		const resolvedIdentity = identity || {
			accountId: `guest:${String(client?.id || 'anonymous')}`,
			assurance: 'guest'
		};
		const session = createSessionRecord({
			client,
			credentials: this.directory.tokens.createCredentials(
				this.directory.sessions
			),
			identity: resolvedIdentity,
			joinKey,
			playerId,
			roomId
		});
		this.directory.sessions.set(session.resumeToken, session);
		this.directory.clientTokens.set(client, session.resumeToken);
		this.directory.joinKeys.bind(session);
		return session;
	}

	requireToken(resumeToken) {
		const session = this.directory.sessions.get(resumeToken);
		if (!session || this.directory.isExpired(session)) {
			throw sessionError(
				'SESSION_EXPIRED',
				'The reconnect session is unavailable.'
			);
		}
		return session;
	}

	resume(client, resumeToken) {
		const session = this.requireToken(resumeToken);
		if (session.client && session.client !== client) {
			throw sessionError(
				'SESSION_ACTIVE',
				'The player session is already connected.'
			);
		}
		session.client = client;
		session.expiresAt = null;
		this.directory.clientTokens.set(client, resumeToken);
		return session;
	}

	forClient(client) {
		const token = this.directory.clientTokens.get(client);
		const session = this.directory.sessions.get(token);
		if (!session) {
			throw sessionError(
				'NOT_IN_WORLD',
				'Join a world before issuing this command.'
			);
		}
		return session;
	}

	disconnect(client) {
		const session = this.forClient(client);
		this.directory.clientTokens.delete(client);
		session.client = null;
		session.expiresAt = this.directory.clock() +
			this.directory.gracePeriodMs;
		return session;
	}

	close(client) {
		const session = this.forClient(client);
		this.directory.clientTokens.delete(client);
		this.directory.sessions.delete(session.resumeToken);
		this.directory.joinKeys.release(session);
		return session;
	}
}

module.exports = { WorldSessionLifecycle };
