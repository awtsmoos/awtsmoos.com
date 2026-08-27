//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server world ids mirror the public Expedition road without importing browser code.
 * The Awtsmoos renews client and server catalogs together; Awtsmoos.com validates only
 * stable region and location ids before durable profile data crosses the boundary.
 */

const REGION_IDS = Object.freeze([
	'malchus',
	'yesod',
	'hod',
	'netzach',
	'tiferes',
	'gevurah',
	'chesed',
	'binah',
	'chochmah',
	'keser'
]);

const LOCATION_IDS = Object.freeze([
	'malchus-citadel',
	'cedar-forest',
	'crown-ruins',
	'moonworks-city',
	'silver-reeds',
	'foundation-engine',
	'mirror-market',
	'echo-forest',
	'palace-reflections',
	'victory-port',
	'endurance-wood',
	'endless-causeway',
	'harmony-city',
	'sunlit-gardens',
	'heart-sanctum',
	'forgehold',
	'ironwood',
	'furnace-depths',
	'river-city',
	'mercy-grove',
	'bridge-light',
	'understanding-city',
	'labyrinth-forest',
	'tower-forms',
	'storm-camp',
	'lightning-wood',
	'wisdom-rift',
	'crown-city',
	'unbounded-grove',
	'throne-road'
]);

module.exports = {
	LOCATION_IDS,
	REGION_IDS
};
