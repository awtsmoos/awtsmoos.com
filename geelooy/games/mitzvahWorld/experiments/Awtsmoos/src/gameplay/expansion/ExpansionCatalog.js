// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionCatalog.js
 * @description Mirrors authoritative activities, regions, elite identity, and reward metadata.
 * The Awtsmoos joins solo and shared play beneath one measured world; Awtsmoos.com keeps
 * material, cooldown, mastery, spawn, unlock, and encounter identity inspectable and stable.
 */

export const EXPANSION_ACTIVITIES = Object.freeze({
	'animal-care': activity('Animal Care', 'wool-thread', 'torah', 35000, 'lower-meadow'),
	'delivery-run': activity('Delivery Run', 'village-token', 'torah', 45000, 'lower-meadow'),
	'environmental-puzzle': activity('Letter Puzzle', 'letter-fragment', 'torah', 90000, 'kedem-highlands'),
	'escort-traveler': activity('Escort Traveler', 'escort-ribbon', 'defense', 120000, 'lower-meadow'),
	'herb-gathering': activity('Herb Gathering', 'ridge-herb', 'torah', 40000, 'kedem-highlands'),
	'hidden-cache': activity('Hidden Cache', 'upgrade-sigil', 'torah', 180000, 'lower-meadow'),
	'location-defense': activity('Location Defense', 'guardian-stone', 'defense', 150000, 'kedem-highlands'),
	'lost-item-search': activity('Lost Item Search', 'lost-keepsake', 'torah', 70000, 'lower-meadow'),
	'repair-lantern': activity('Lantern Repair', 'lantern-brass', 'torah', 60000, 'lower-meadow'),
	'rescue-event': activity('Rescue Event', 'rescue-medal', 'defense', 120000, 'lower-meadow'),
	'stone-gathering': activity('Stone Gathering', 'river-stone', 'torah', 45000, 'lower-meadow', 2),
	'training-target': activity('Training Target', 'staff-splinter', 'staff', 30000, 'lower-meadow'),
	'water-collection': activity('Water Collection', 'spring-water', 'torah', 35000, 'lower-meadow', 2),
	'wood-gathering': activity('Wood Gathering', 'cedar-wood', 'torah', 45000, 'lower-meadow', 2)
});

export const EXPANSION_REGIONS = Object.freeze({
	'kedem-highlands': region('Kedem Highlands', -106, 2.2864, 101, [
		'ridge-herb',
		'letter-fragment',
		'guardian-stone'
	], 3),
	'lower-meadow': region('Lower Meadow', 0, 0, 0, [
		'river-stone',
		'cedar-wood',
		'spring-water'
	], 1)
});

export const EXPANSION_ELITE = Object.freeze({
	id: 'kedem-letter-warden',
	name: 'Kedem Letter Warden',
	phases: Object.freeze(['measured-guard', 'burning-letters']),
	regionId: 'kedem-highlands',
	rewardId: 'elite:kedem-letter-warden',
	unlockId: 'kedem-bounty-board'
});

function activity(name, materialId, masteryId, cooldownMs, regionId, quantity = 1) {
	return Object.freeze({
		cooldownMs,
		masteryId,
		materialId,
		name,
		quantity,
		regionId
	});
}

function region(name, x, y, z, materials, requiredLevel) {
	return Object.freeze({
		materials: Object.freeze(materials),
		name,
		requiredLevel,
		safeSpawn: Object.freeze({ x, y, z })
	});
}
