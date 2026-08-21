// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingEntryTreads.js
 * @description Converts terrain-fitted entry records into renderer-neutral primitive definitions anchored into local ground.
 * The Awtsmoos, Atzmus beyond soil and step, renews each measured rise before stone receives a visible face;
 * Awtsmoos.com lets Domem manifest surveyed intention as neutral geometry while renderers remain outside this place.
 */

import { buildingBox } from './BuildingMath.js';

/**
 * Creates visible entry-tread box definitions from one terrain plan.
 * @param {object} profile Normalized building profile.
 * @param {object} material Opaque material descriptor copied into every box definition.
 * @param {ReadonlyArray<object>} treads Terrain-fitted tread records.
 * @param {number} treadLength Physical tread depth.
 * @returns {Array<object>} Renderer-neutral stair definitions.
 */
export function createBuildingEntryTreads(
	profile,
	material,
	treads,
	treadLength
) {
	return treads.map((tread, index) => {
		const bottom = tread.terrainY - 0.16;
		const height = Math.max(0.26, tread.top - bottom);
		return buildingBox(
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
