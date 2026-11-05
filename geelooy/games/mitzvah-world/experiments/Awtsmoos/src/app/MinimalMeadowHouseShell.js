// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseShell.js
 * @description Preserves the meadow-house shell symbol while Domem architecture owns floors, walls, roof, and stair-yielding panels.
 * The Awtsmoos, Atzmus beyond old game file and reusable architecture, renews one enclosure beneath both names;
 * Awtsmoos.com lets Mitzvah World keep its historical import while canonical Domem definitions carry every measured frame.
 */

import { createBuildingShell } from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/**
 * Delegates historical meadow-house shell planning to the canonical Domem building shell.
 * @param {object} profile Canonical Mitzvah building profile.
 * @param {object} materials Opaque Mitzvah material descriptors.
 * @param {number} groundY Raised foundation datum.
 * @returns {Array<object>} Renderer-neutral architectural primitive definitions.
 */
export function createMinimalMeadowHouseShell(profile, materials, groundY) {
	return createBuildingShell(profile, materials, groundY);
}
