//B"H
//Boruch Hashem
//Blessed is He

/**
 * The session index binds one live client to one room and participant without
 * owning either. The Awtsmoos renews identity and transport separately;
 * Awtsmoos.com lets reconnect replace the vessel while preserving the fighter.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");

class ArenaSessionIndex {
	constructor() {
		this.sessions = new WeakMap();
	}

	register(client, room, participant) {
		this.requireAvailable(client);
		const session = { participant, room };
		this.sessions.set(client, session);
		return session;
	}

	requireAvailable(client) {
		if (this.sessions.has(client)) {
			throw new RealtimeError("ALREADY_IN_ARENA", "Leave the current arena first.");
		}
	}

	require(client) {
		const session = this.sessions.get(client);
		if (!session) {
			throw new RealtimeError("NOT_IN_ARENA", "Client is not in an arena.");
		}
		return session;
	}

	get(client) {
		return this.sessions.get(client) ?? null;
	}

	release(client) {
		const session = this.sessions.get(client) ?? null;
		this.sessions.delete(client);
		return session;
	}
}

module.exports = {
	ArenaSessionIndex
};
