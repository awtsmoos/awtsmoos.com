// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayRegionCatalog.js
 * @description Declares canonical regions, aliases, spawns, cells, materials, and encounters.
 * The Awtsmoos unfolds one world through many bounded chambers; Awtsmoos.com keeps each
 * transition reversible, multiplayer-addressable, streamable, and rooted in a safe checkpoint.
 */

const REGIONS = Object.freeze({
	'lower-meadow': region({
		activityIds: ['wood-gathering', 'stone-gathering', 'animal-care', 'repair-lantern'],
		cellIds: ['meadow-village', 'river-crossing', 'forest-edge'],
		eliteId: null,
		materialIds: ['cedar-wood', 'river-stone', 'spring-water'],
		missionChainId: 'river-valley-service',
		requiredLevel: 1,
		safeSpawn: { x: 0, y: 0, z: 0 }
	}),
	'kedem-highlands': region({
		activityIds: ['herb-gathering', 'environmental-puzzle', 'location-defense'],
		cellIds: ['kedem-gate', 'letter-ridge', 'summit-sanctuary'],
		eliteId: 'kedem-letter-warden',
		materialIds: ['ridge-herb', 'letter-fragment', 'guardian-stone'],
		missionChainId: 'letters-on-the-ridge',
		requiredLevel: 3,
		safeSpawn: { x: -106, y: 2.2864, z: 101 }
	})
});

const REGION_ALIASES = Object.freeze({
	'letter-highlands': 'kedem-highlands',
	'meadow-valley': 'lower-meadow'
});

function canonicalRegionId(regionId) {
	return REGION_ALIASES[regionId] || regionId;
}

function region(definition) {
	return Object.freeze({
		...definition,
		activityIds: Object.freeze(definition.activityIds),
		cellIds: Object.freeze(definition.cellIds),
		materialIds: Object.freeze(definition.materialIds),
		safeSpawn: Object.freeze(definition.safeSpawn)
	});
}

module.exports = {
	REGIONS,
	REGION_ALIASES,
	canonicalRegionId
};
