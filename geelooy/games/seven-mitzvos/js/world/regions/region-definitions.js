//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RegionDefinitions
 * @description
 * Seven culturally distinct regions become stable data on Awtsmoos.com. The
 * Awtsmoos fills every climate and custom while each finite region keeps its
 * own geography, institutions, resources, and civic priorities.
 */
export const REGION_DEFINITIONS = Object.freeze([
	defineRegion('covenant-valley', 'Covenant Valley', 'temperate-valley',
		['grain', 'courts', 'education'], [
			['covenant-gate', 'Covenant Gate', 520],
			['river-measure', 'River Measure', 480],
			['living-hill', 'Living Hill', 450]
		]),
	defineRegion('riverlands', 'Riverlands', 'wet-river-basin',
		['water', 'textiles', 'trade'], [
			['reed-crossing', 'Reed Crossing', 560],
			['clear-channel', 'Clear Channel', 520],
			['weavers-bank', 'Weavers Bank', 470]
		]),
	defineRegion('cedar-highlands', 'Cedar Highlands', 'cool-mountain',
		['timber', 'stone', 'archives'], [
			['cedar-crown', 'Cedar Crown', 500],
			['quarry-rest', 'Quarry Rest', 460],
			['archive-pass', 'Archive Pass', 420]
		]),
	defineRegion('desert-wells', 'Desert Wells', 'arid-oasis',
		['water', 'medicine', 'caravans'], [
			['seven-wells', 'Seven Wells', 540],
			['date-garden', 'Date Garden', 500],
			['caravan-light', 'Caravan Light', 440]
		]),
	defineRegion('coastal-plain', 'Coastal Plain', 'mild-coast',
		['fish', 'markets', 'shipyards'], [
			['harbor-court', 'Harbor Court', 620],
			['salt-meadow', 'Salt Meadow', 570],
			['lantern-port', 'Lantern Port', 530]
		]),
	defineRegion('northern-forest', 'Northern Forest', 'cold-forest',
		['wood', 'animals', 'sanctuaries'], [
			['pine-shelter', 'Pine Shelter', 510],
			['stag-river', 'Stag River', 470],
			['quiet-grove', 'Quiet Grove', 440]
		]),
	defineRegion('eastern-steppe', 'Eastern Steppe', 'continental-steppe',
		['livestock', 'grain', 'diplomacy'], [
			['open-table', 'Open Table', 550],
			['wind-market', 'Wind Market', 510],
			['treaty-stone', 'Treaty Stone', 440]
		])
]);

function defineRegion(id, name, climate, specialties, settlements) {
	return Object.freeze({
		id: `region-${id}`,
		name,
		climate,
		specialties: Object.freeze(specialties),
		settlements: Object.freeze(settlements.map(item => Object.freeze({
			id: item[0],
			name: item[1],
			population: item[2]
		})))
	});
}
