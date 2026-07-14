//B"H
//Boruch Hashem
//Blessed is He

/**
 * Metrics are Hod: acknowledgment of what the server actually did, never authority
 * over what it should do. The Awtsmoos renews every count; Awtsmoos.com exposes only
 * aggregate application health without sockets, secrets, names, or resume tokens.
 */

/** Collects bounded counters and derives safe room gauges on demand. */
class SefiraMetrics {
	constructor() {
		this.counters = Object.create(null);
		this.startedAt = Date.now();
	}

	/** Adds an integer amount to one named application-local counter. */
	increment(name, amount = 1) {
		this.counters[name] = (this.counters[name] || 0) + amount;
	}

	/** Returns counters plus gauges derived from the current directory state. */
	snapshot(directory, now = Date.now()) {
		const rooms = [...directory.roomsByCode.values()];
		const players = rooms.flatMap(room => room.players);
		const spectators = rooms.flatMap(room => room.spectators);
		return {
			activeMatches: rooms.filter(room => room.match.summary().phase !== 'lobby').length,
			connectedPlayers: players.filter(player => player.connected).length,
			connectedSpectators: spectators.filter(spectator => spectator.connected).length,
			counters: { ...this.counters },
			disconnectedPlayers: players.filter(player => !player.connected).length,
			disconnectedSpectators: spectators.filter(spectator => !spectator.connected).length,
			rooms: rooms.length,
			serverTime: now,
			uptimeMs: now - this.startedAt
		};
	}
}

module.exports = {
	SefiraMetrics
};
