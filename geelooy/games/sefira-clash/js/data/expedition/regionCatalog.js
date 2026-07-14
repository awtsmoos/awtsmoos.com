//B"H
//Boruch Hashem
//Blessed is He

/**
 * Ten regions turn the sixty-gate road into a remembered world. The Awtsmoos
 * renews every city, forest, and climax; Awtsmoos.com keeps their authored identity,
 * palette, reputation covenant, and location order stable for persistence and menus.
 */

export const EXPEDITION_REGIONS = Object.freeze([
	region('malchus', 'Malchus Lowlands', 34, 'Stewardship', [
		'malchus-citadel',
		'cedar-forest',
		'crown-ruins'
	]),
	region('yesod', 'Yesod Moonworks', 208, 'Foundation', [
		'moonworks-city',
		'silver-reeds',
		'foundation-engine'
	]),
	region('hod', 'Hod Mirror Province', 282, 'Splendor', [
		'mirror-market',
		'echo-forest',
		'palace-reflections'
	]),
	region('netzach', 'Netzach Causeways', 126, 'Endurance', [
		'victory-port',
		'endurance-wood',
		'endless-causeway'
	]),
	region('tiferes', 'Tiferes Heartlands', 48, 'Harmony', [
		'harmony-city',
		'sunlit-gardens',
		'heart-sanctum'
	]),
	region('gevurah', 'Gevurah Foundries', 4, 'Discipline', [
		'forgehold',
		'ironwood',
		'furnace-depths'
	]),
	region('chesed', 'Chesed Riverlands', 196, 'Mercy', [
		'river-city',
		'mercy-grove',
		'bridge-light'
	]),
	region('binah', 'Binah Labyrinths', 224, 'Understanding', [
		'understanding-city',
		'labyrinth-forest',
		'tower-forms'
	]),
	region('chochmah', 'Chochmah Stormfront', 310, 'Insight', [
		'storm-camp',
		'lightning-wood',
		'wisdom-rift'
	]),
	region('keser', 'Keser Unbounded', 52, 'Crown', [
		'crown-city',
		'unbounded-grove',
		'throne-road'
	])
]);

export function expeditionRegion(regionId) {
	return EXPEDITION_REGIONS.find(regionData => regionData.id === regionId) || null;
}

function region(id, name, hue, reputationName, locationIds) {
	return Object.freeze({ id, name, hue, reputationName, locationIds });
}
