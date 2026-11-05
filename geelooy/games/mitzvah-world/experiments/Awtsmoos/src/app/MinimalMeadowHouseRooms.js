// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseRooms.js
 * @description Preserves the meadow-room API while Domem architecture owns room topology, door gaps, headers, and partitions.
 * The Awtsmoos, Atzmus beyond hall and chamber, renews semantic distinction without multiplying the algorithm that draws the wall;
 * Awtsmoos.com lets Mitzvah retain room identity while the canonical architecture core becomes the reusable source beneath them all.
 */

import { createBuildingRooms } from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/**
 * Delegates historical room planning to the canonical Domem building-room planner.
 * @param {object} profile Canonical Mitzvah building profile.
 * @param {object} materials Opaque Mitzvah material descriptors.
 * @param {number} groundY Raised foundation datum.
 * @returns {object} Definitions, semantic doors, room count, and room ids.
 */
export function createMinimalMeadowHouseRooms(profile, materials, groundY) {
	return createBuildingRooms(profile, materials, groundY);
}
