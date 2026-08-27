//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * One server may wear old and new property names without splitting its memory.
 * The Awtsmoos renews every collection; Awtsmoos.com binds compatibility names
 * to one canonical vessel so applications cannot create contradictory worlds.
 */

/** Returns one shared Map and binds every compatibility name to it. */
function ensureMap(server, names) {
	const maps = names
		.map(name => server[name])
		.filter(value => value instanceof Map);
	const collection = maps[0] || new Map();

	for (const map of maps.slice(1)) {
		for (const [key, value] of map) {
			if (!collection.has(key)) {
				collection.set(key, value);
			}
		}
	}
	for (const name of names) {
		server[name] = collection;
	}
	return collection;
}

/** Returns one shared Set and binds every compatibility name to it. */
function ensureSet(server, names) {
	const sets = names
		.map(name => server[name])
		.filter(value => value instanceof Set);
	const collection = sets[0] || new Set();

	for (const set of sets.slice(1)) {
		for (const value of set) {
			collection.add(value);
		}
	}
	for (const name of names) {
		server[name] = collection;
	}
	return collection;
}

/**
 * Reveals the canonical server collections while preserving historical names.
 *
 * @param {object} server WebSocket server or compatible test vessel.
 * @returns {object} Stable collections shared by transport and applications.
 */
function ensureServerState(server) {
	if (!server || typeof server !== "object") {
		throw new TypeError("Realtime server state requires an object.");
	}

	return {
		aliasMap: ensureMap(server, ["aliasMap"]),
		clients: ensureSet(server, ["clients"]),
		pendingTunnelRequests: ensureMap(server, ["pendingTunnelRequests"]),
		settingsCache: ensureMap(server, ["settingsCache"]),
		tunnelRegistrations: ensureMap(server, ["tunnelRegistrations"]),
		tunnels: ensureMap(server, ["tunnels", "tunnelClients"])
	};
}

module.exports = {
	ensureMap,
	ensureServerState,
	ensureSet
};
