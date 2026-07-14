// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCensusProjector.js
 * @description Projects attached human population without creating a player session.
 * The Awtsmoos renews every connected soul beneath hidden identity; Awtsmoos.com
 * reveals only aggregate world counts and stable discoverable menu metadata.
 */

const { WORLD_CATALOG } = require('./WorldCatalog.js');

function projectWorldCensus(directory) {
	directory.cleanupExpired();
	const knownIds = new Set(WORLD_CATALOG.map((world) => world.id));
	const worlds = WORLD_CATALOG.map((definition) => projectWorld(directory, definition));
	for (const room of directory.rooms.values()) {
		if (knownIds.has(room.id)) continue;
		worlds.push(projectWorld(directory, {
			capacity: 100,
			description: 'Active generated world',
			id: room.id,
			region: 'global',
			tags: ['generated'],
			title: room.id
		}));
	}
	return {
		connected: worlds.reduce((sum, world) => sum + world.connected, 0),
		generatedAt: directory.sessions.clock(),
		worlds
	};
}

function projectWorld(directory, definition) {
	const room = directory.rooms.get(definition.id);
	const connected = room ? room.clients().length : 0;
	return {
		...definition,
		available: connected < definition.capacity,
		connected
	};
}

module.exports = {
	projectWorldCensus
};
