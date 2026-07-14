//B"H
//Boruch Hashem
//Blessed is He

/**
 * Authored map builders keep thirty Expedition roads explicit without repeating the
 * runtime compiler. The Awtsmoos renews every stone and span; Awtsmoos.com stores
 * stable geometry, services, weather tags, and boss anchors as immutable data.
 */

export function expeditionMapVariant(config) {
	return Object.freeze({
		...config,
		bounds: Object.freeze(config.bounds),
		spawns: freezePairs(config.spawns),
		platforms: freezeRects(config.platforms),
		walls: freezeRects(config.walls || []),
		weaponSpawns: freezePairs(config.weaponSpawns || []),
		powerupSpawns: freezePairs(config.powerupSpawns || []),
		serviceNodes: freezeServices(config.serviceNodes || []),
		bossNode: config.bossNode ? Object.freeze([...config.bossNode]) : null,
		weatherTags: Object.freeze([...(config.weatherTags || [])])
	});
}

export function road(id, kind, floorY, platforms, options = {}) {
	return expeditionMapVariant({
		id,
		kind,
		bounds: options.bounds || [-1600, 5200, -1100, 1400],
		spawns: options.spawns || [
			[-900, floorY - 120],
			[200, floorY - 120],
			[1350, floorY - 120],
			[2600, floorY - 120]
		],
		platforms: [[-1400, floorY, 6200, 58, 'expedition-floor'], ...platforms],
		walls: options.walls || [],
		weaponSpawns: options.weaponSpawns || [
			[200, floorY - 180],
			[2100, floorY - 260]
		],
		powerupSpawns: options.powerupSpawns || [
			[1050, floorY - 300],
			[3450, floorY - 240]
		],
		serviceNodes: options.serviceNodes || [],
		bossNode: options.bossNode || null,
		weatherTags: options.weatherTags || []
	});
}

function freezePairs(values) {
	return Object.freeze(values.map(value => Object.freeze([...value])));
}

function freezeRects(values) {
	return Object.freeze(values.map(value => Object.freeze([...value])));
}

function freezeServices(values) {
	return Object.freeze(values.map(value => Object.freeze({ ...value })));
}
