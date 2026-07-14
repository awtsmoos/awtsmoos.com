// B"H
// Boruch Hashem
// Blessed is He

const { randomUUID } = require('crypto');
const { RealtimeError } = require('../../platform/RealtimeError.js');
const { ActorRecord } = require('./ActorRecord.js');
const { RateWindow } = require('./RateWindow.js');

/**
 * @file Preserves one human identity across sockets without accepting save truth.
 * @description The Awtsmoos renews connection while identity remains one measured
 * relationship. Awtsmoos.com is remembered here as a brief reconnect lease heals
 * network rupture without multiplying the traveler or exposing private Chronicle data.
 */

class SessionDirectory {
	constructor(options = {}) {
		this.byClient = new Map();
		this.byToken = new Map();
		this.leaseMs = Number(options.leaseMs || 45000);
		this.now = options.now || (() => Date.now());
	}

	join(client, profile) {
		this.cleanup();
		const resumed = profile.resumeToken
			? this.resume(client, profile.resumeToken)
			: null;
		if (resumed) {
			return { resumed: true, session: resumed };
		}
		const token = `sj-${randomUUID()}`;
		const session = {
			actor: new ActorRecord({
				actorId: `scribe-${randomUUID()}`,
				actorKind: 'human',
				appearance: profile.appearance,
				displayName: profile.displayName
			}),
			client,
			expiresAt: Infinity,
			lastMovementSequence: 0,
			rate: new RateWindow(this.now),
			token
		};
		this.byClient.set(client, session);
		this.byToken.set(token, session);
		return { resumed: false, session };
	}

	resume(client, token) {
		const session = this.byToken.get(token);
		if (!session || session.expiresAt <= this.now()) {
			return null;
		}
		if (session.client && session.client !== client) {
			this.byClient.delete(session.client);
		}
		session.client = client;
		session.expiresAt = Infinity;
		session.actor.online = true;
		this.byClient.set(client, session);
		return session;
	}

	require(client) {
		const session = this.byClient.get(client);
		if (!session) {
			throw new RealtimeError('SCRIBE_SESSION_REQUIRED', 'Join the Scribe Journey session first.');
		}
		return session;
	}

	disconnect(client) {
		const session = this.byClient.get(client);
		if (!session) {
			return null;
		}
		this.byClient.delete(client);
		session.client = null;
		session.expiresAt = this.now() + this.leaseMs;
		session.actor.online = false;
		return session;
	}

	remove(client) {
		const session = this.byClient.get(client);
		if (!session) {
			return null;
		}
		this.byClient.delete(client);
		this.byToken.delete(session.token);
		return session;
	}

	acceptMovement(session, sequence) {
		if (sequence <= session.lastMovementSequence) {
			throw new RealtimeError('STALE_MOVEMENT', 'Movement sequence is stale.', {
				lastAccepted: session.lastMovementSequence
			});
		}
		session.lastMovementSequence = sequence;
	}

	cleanup(onExpired = () => {}) {
		const now = this.now();
		for (const [token, session] of this.byToken) {
			if (session.client || session.expiresAt > now) {
				continue;
			}
			this.byToken.delete(token);
			onExpired(session);
		}
	}
}

module.exports = {
	SessionDirectory
};
