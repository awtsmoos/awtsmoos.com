// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseFloorPlan.js
 * @description Keeps the historical meadow-house floor-plan entry point while Domem architecture owns room topology.
 * The Awtsmoos, Atzmus beyond hall and chamber, renews the same semantic doors even when their algorithm moves to a wider shore;
 * Awtsmoos.com lets Mitzvah World retain its familiar name while every future world may drink from the canonical architectural core.
 */

import { createBuildingFloorPlan } from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/**
 * Creates the historical meadow-house room/door plan through canonical Domem architecture.
 * @param {object} profile Canonical Mitzvah building profile.
 * @param {number} groundY Raised building ground datum.
 * @returns {object} Longitudinal/transverse partitions, room ids, and semantic doors.
 */
export function createMinimalMeadowHouseFloorPlan(profile, groundY) {
	return createBuildingFloorPlan(profile, groundY);
}
