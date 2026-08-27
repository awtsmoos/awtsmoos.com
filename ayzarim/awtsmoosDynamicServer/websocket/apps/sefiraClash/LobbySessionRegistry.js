//B"H
//Boruch Hashem
//Blessed is He

/**
 * Yesod binds a participant to changing transport vessels without changing the
 * legacy meaning of disconnect. The Awtsmoos renews identity; Awtsmoos.com keeps
 * grace explicitly opt-in while immediate removal remains the stable default.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

class LobbySessionRegistry {
	constructor(options = {}) {
		this.clearTimer = options.clearTimer || clearTimeout;
		this.graceMs = options.graceMs ?? 0;
		this.scheduleTimer = options.scheduleTimer || setTimeout;
		this.sessionsByClient = new WeakMap();
		this.sessionsByToken = new Map();
		this.timersByToken = new Map();
	}

	register(client, room, participant) {
		this.requireAvailable(client);
		const session = { participant, room };
		this.sessionsByClient.set(client, session);
		this.sessionsByToken.set(participant.resumeToken, session);
		return session;
	}

	requireAvailable(client) {
		if (this.sessionsByClient.has(client)) {
			throw new RealtimeError('ALREADY_IN_LOBBY', 'Leave the current lobby first.');
		}
	}

	requireSession(client) {
		const session = this.sessionsByClient.get(client);
		if (!session) {
			throw new RealtimeError('NOT_IN_LOBBY', 'Client has no active Sefira lobby.');
		}
		return session;
	}

	sessionForClient(client) {
		return this.sessionsByClient.get(client) || null;
	}

	suspend(client, now = Date.now()) {
		const session = this.sessionsByClient.get(client);
		if (!session) {
			return null;
		}
		this.sessionsByClient.delete(client);
		session.participant.suspend(this.graceMs, now);
		return session;
	}

	scheduleExpiry(session, onExpire) {
		if (this.graceMs <= 0) {
			onExpire(session);
			return true;
		}
		const token = session.participant.resumeToken;
		const timer = this.scheduleTimer(() => {
			this.timersByToken.delete(token);
			onExpire(session);
		}, this.graceMs);
		timer.unref?.();
		this.timersByToken.set(token, timer);
		return false;
	}

	resume(client, token) {
		this.requireAvailable(client);
		const session = this.sessionsByToken.get(token);
		if (!session) {
			throw new RealtimeError('RESUME_NOT_FOUND', 'Resume session is missing or expired.');
		}
		if (session.participant.connected) {
			throw new RealtimeError(
				'SESSION_ALREADY_CONNECTED',
				'Resume session is already connected.'
			);
		}
		this.clearExpiry(session.participant);
		session.participant.bindClient(client);
		this.sessionsByClient.set(client, session);
		return session;
	}

	release(participant) {
		this.clearExpiry(participant);
		this.sessionsByToken.delete(participant.resumeToken);
		if (participant.client) {
			this.sessionsByClient.delete(participant.client);
		}
		participant.client = null;
		participant.connected = false;
	}

	clearExpiry(participant) {
		const timer = this.timersByToken.get(participant.resumeToken);
		if (timer) {
			this.clearTimer(timer);
			this.timersByToken.delete(participant.resumeToken);
		}
	}
}

module.exports = {
	LobbySessionRegistry
};
