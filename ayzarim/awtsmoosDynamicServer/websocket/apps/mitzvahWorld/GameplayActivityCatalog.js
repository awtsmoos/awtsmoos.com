// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayActivityCatalog.js
 * @description Declares repeatable world work with solo-safe scaling and durable materials.
 * The Awtsmoos renews humble service between great quests; Awtsmoos.com keeps every task
 * measurable through region, cooldown, mastery, material, quantity, experience, and scale.
 */

const ACTIVITIES = Object.freeze({
	'animal-care': activity('care', 'wool-thread', 1, 35000, 18),
	'delivery-run': activity('delivery', 'village-token', 1, 45000, 20),
	'environmental-puzzle': activity('puzzle', 'letter-fragment', 1, 90000, 32, 'kedem-highlands'),
	'escort-traveler': activity('escort', 'escort-ribbon', 1, 120000, 38),
	'herb-gathering': activity('gather', 'ridge-herb', 1, 40000, 16, 'kedem-highlands'),
	'hidden-cache': activity('search', 'upgrade-sigil', 1, 180000, 45),
	'location-defense': activity('defense', 'guardian-stone', 1, 150000, 50),
	'lost-item-search': activity('search', 'lost-keepsake', 1, 70000, 24),
	'repair-lantern': activity('repair', 'lantern-brass', 1, 60000, 22),
	'rescue-event': activity('rescue', 'rescue-medal', 1, 120000, 42),
	'stone-gathering': activity('gather', 'river-stone', 2, 45000, 16),
	'training-target': activity('train', 'staff-splinter', 1, 30000, 20),
	'water-collection': activity('gather', 'spring-water', 2, 35000, 14),
	'wood-gathering': activity('gather', 'cedar-wood', 2, 45000, 16)
});

function activity(type, materialId, quantity, cooldownMs, xp, regionId = 'lower-meadow') {
	return Object.freeze({
		cooldownMs,
		materialId,
		masteryId: masteryFor(type),
		quantity,
		regionId,
		soloScale: 1,
		type,
		xp
	});
}

function masteryFor(type) {
	if (type === 'train') return 'staff';
	if (type === 'defense' || type === 'rescue' || type === 'escort') return 'defense';
	return 'torah';
}

module.exports = {
	ACTIVITIES
};
