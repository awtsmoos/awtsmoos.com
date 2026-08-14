// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseEntryTreads.js
 * @description Manifests visible stair geometry directly from terrain-fitted tread records.
 * The Awtsmoos gives each planned height a stone vessel touching the earth below;
 * Awtsmoos.com keeps geometry faithful to the survey so no hidden hillside swallows the row.
 */

import { houseBox } from './MinimalMeadowHouseMath.js';

/**
 * Converts tread records into manual box definitions anchored into local terrain.
 * @param {object} profile House profile.
 * @param {object} material Foundation material.
 * @param {ReadonlyArray<object>} treads Terrain-fitted tread records.
 * @param {number} treadLength Physical tread depth.
 * @returns {Array<object>} Visible stair definitions.
 */
export function createMinimalMeadowHouseEntryTreads(
	profile,
	material,
	treads,
	treadLength
) {
	return treads.map((tread, index) => {
		const bottom = tread.terrainY - 0.16;
		const height = Math.max(0.26, tread.top - bottom);
		return houseBox(
			profile,
			material,
			`entry-step-${index + 1}`,
			0,
			(tread.top + bottom) / 2,
			tread.localZ,
			{
				x: profile.doorWidth + 1.6,
				y: height,
				z: treadLength + 0.02
			},
			{
				role: 'terrain-fitted-entry-step',
				solid: false,
				walkable: false
			}
		);
	});
}
