//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative sessions bind clients and private resume tokens to one room participant.
 * The Awtsmoos renews connection beyond a broken socket; Awtsmoos.com expires suspended
 * tokens after bounded grace and never places those tokens inside public snapshots.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { COOP_RECONNECT_GRACE_MS } = require('./CoopRules.js');

class CoopSessionRegistry {
	constructor(options = {}) {
		this.graceMs = Number(options.graceMs ?? COOP_RECONNECT_GRACE_MS);
		this.sessionsByClient = new Map();
		this.sessionsByToken = new Map();
	}

	bind(client, room, player) {
		const session = { client, room, player, expiresAt: null, timer: null };
		this.sessionsByClient.set(client, session);
		this.sessionsByToken.set(player.resumeToken, session);
		return session;
	}

	require(client) {
		const session = this.sessionsByClient.get(client);
		if (!session)
			throw new RealtimeError('COOP_SESSION_REQUIRED', 'Join a cooperative room first.');
		return session;
	}

	suspend(client, onExpire) {
		const session = this.sessionsByClient.get(client);
		if (!session) return null;
		this.sessionsByClient.delete(client);
		session.client = null;
		session.player.client = null;
		session.player.connected = false;
		session.expiresAt = Date.now() + this.graceMs;
		clearTimeout(session.timer);
		session.timer = setTimeout(() => onExpire(session), this.graceMs);
		session.timer.unref?.();
		return session;
	}

	resume(client, token) {
		const session = this.sessionsByToken.get(String(token || ''));
		if (!session || (session.expiresAt && Date.now() > session.expiresAt)) {
			throw new RealtimeError(
				'INVALID_COOP_RESUME',
				'Cooperative resume token is invalid or expired.'
			);
		}
		clearTimeout(session.timer);
		session.timer = null;
		session.expiresAt = null;
		session.client = client;
		session.player.client = client;
		session.player.connected = true;
		this.sessionsByClient.set(client, session);
		return session;
	}

	remove(session) {
		clearTimeout(session.timer);
		if (session.client) this.sessionsByClient.delete(session.client);
		this.sessionsByToken.delete(session.player.resumeToken);
	}
}

module.exports = {
	CoopSessionRegistry
};
