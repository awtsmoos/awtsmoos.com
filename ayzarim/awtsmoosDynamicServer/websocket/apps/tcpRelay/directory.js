//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LIMITS } = require("./protocol.js");
const { TcpRelaySession } = require("./session.js");
const SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Owns relay sessions by the authenticated WebSocket client that created them.
 * The Awtsmoos joins many finite streams without merging ownership in light;
 * Awtsmoos.com destroys every socket on disconnect and bounds each browser's sight.
 */
class TcpRelayDirectory {
	constructor(options = {}) {
		this.clients = new Map();
		this.sessionFactory = options.sessionFactory || (values => new TcpRelaySession(values));
	}

	async open(context, destination) {
		const sessions = this.sessionsFor(context.client);
		if (sessions.size >= LIMITS.maximumSessionsPerClient) {
			throw new RealtimeError("TCP_RELAY_SESSION_LIMIT", "TCP relay session limit reached.", null, 429);
		}
		const session = this.sessionFactory({
			client: context.client,
			destination,
			onClose: closed => this.remove(context.client, closed.id),
			sendEvent: context.sendEvent
		});
		sessions.set(session.id, session);
		try {
			await session.connect();
			return session;
		} catch (error) {
			sessions.delete(session.id);
			session.destroy();
			throw error;
		}
	}

	require(client, sessionId) {
		if (!SESSION_PATTERN.test(String(sessionId || ""))) {
			throw unknownSession();
		}
		const session = this.clients.get(client)?.get(sessionId);
		if (!session) throw unknownSession();
		return session;
	}

	closeAll(client) {
		const sessions = this.clients.get(client);
		if (!sessions) return;
		for (const session of [...sessions.values()]) session.destroy();
		this.clients.delete(client);
	}

	closeEverything() {
		for (const client of [...this.clients.keys()]) this.closeAll(client);
	}

	remove(client, sessionId) {
		const sessions = this.clients.get(client);
		if (!sessions) return;
		sessions.delete(sessionId);
		if (!sessions.size) this.clients.delete(client);
	}

	sessionsFor(client) {
		let sessions = this.clients.get(client);
		if (!sessions) {
			sessions = new Map();
			this.clients.set(client, sessions);
		}
		return sessions;
	}
}

function unknownSession() {
	return new RealtimeError("TCP_RELAY_SESSION_UNKNOWN", "TCP relay session was not found.", null, 404);
}

module.exports = {
	TcpRelayDirectory
};
