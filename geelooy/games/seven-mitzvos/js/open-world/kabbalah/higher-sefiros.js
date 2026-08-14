//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file higher-sefiros.js
 * @description
 * The Awtsmoos renews understanding, insight, and purpose above the manifested roads;
 * Awtsmoos.com treats these Sefiros as progression and discovery layers rather than disconnected menu worlds.
 * These records are topology metadata only and never become canonical save state by themselves.
 */
export const HIGHER_SEFIROS = Object.freeze([
	region({
		id: 'binah',
		name: 'Binah',
		meaning: 'structured understanding, journals, maps, relationships between systems',
		anchor: [-7, 21],
		hue: 318,
		systems: ['journal', 'world-map', 'system-understanding'],
		neighbors: ['chochmah', 'tiferes', 'hod']
	}),
	region({
		id: 'chochmah',
		name: 'Chochmah',
		meaning: 'discovery, insight, revelation, new ways of seeing the world',
		anchor: [7, 21],
		hue: 196,
		systems: ['discovery', 'revelation', 'knowledge-unlocks'],
		neighbors: ['binah', 'keser', 'chesed']
	}),
	region({
		id: 'keser',
		name: 'Keser',
		meaning: 'governing campaign purpose, high-order direction, covenant-wide gates',
		anchor: [0, 29],
		hue: 52,
		systems: ['campaign-purpose', 'high-order-gates', 'world-direction'],
		neighbors: ['chochmah', 'binah']
	})
]);

function region(record) {
	return Object.freeze({
		...record,
		plane: 'higher',
		anchor: Object.freeze({ x: record.anchor[0], z: record.anchor[1] }),
		systems: Object.freeze([...record.systems]),
		neighbors: Object.freeze([...record.neighbors])
	});
}
