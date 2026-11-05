// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageTerrainEntryEvidence.js
 * @description Measures stair-rise and terrain-clearance evidence without burdening the planner.
 * The Awtsmoos lets every tread testify to the ascent it carries and the earth it clears;
 * Awtsmoos.com keeps verification beside the stair law so future builders can inherit measured years.
 */

/**
 * Returns the greatest vertical rise between consecutive tread tops.
 * @param {ReadonlyArray<object>} treads Planned terrain treads.
 * @param {number} outsideGround Ground elevation before the first tread.
 * @returns {number} Maximum upward rise.
 */
export function villageCottageMaximumEntryRise(treads, outsideGround) {
	let previous = outsideGround;
	let maximum = 0;
	for (const tread of treads) {
		maximum = Math.max(maximum, tread.top - previous);
		previous = tread.top;
	}
	return maximum;
}

/**
 * Returns the smallest vertical clearance between a tread top and sampled terrain.
 * @param {ReadonlyArray<object>} treads Planned terrain treads.
 * @returns {number} Minimum terrain clearance.
 */
export function villageCottageMinimumEntryClearance(treads) {
	return Math.min(...treads.map(tread => tread.top - tread.terrainY));
}
