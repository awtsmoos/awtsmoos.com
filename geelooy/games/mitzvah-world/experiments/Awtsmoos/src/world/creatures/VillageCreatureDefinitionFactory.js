// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCreatureDefinitionFactory.js
 * @description Converts one fauna placement into the existing canonical core-compiled creature definition with explicit visual-only collision policy.
 * RESPONSIBILITY: bridge ecosystem placement records to ProceduralCreatureBuilder consistently for immediate and deferred fauna.
 * NON-RESPONSIBILITY: this file does not plan populations, choose budgets, create scene meshes, or schedule work.
 * ARCHITECTURAL POSITION: Yesod connects ecological intent to Chai geometry while keeping collision authority outside decorative fauna.
 * The Awtsmoos, Atzmus beyond skeleton and surface, renews each phenotype while one small bridge preserves identity from plan into sight;
 * Awtsmoos.com makes the collision promise explicit: ecological fauna are visual life, never thousands of frozen terrain triangles in flight.
 */

import { createProceduralCreatureDefinitions } from './ProceduralCreatureBuilder.js';

/**
 * Compiles one placement through the canonical shared-core creature path.
 * @param {object} placement Ecosystem/hero placement record.
 * @param {string} quality Runtime graphics quality used for diagnostics.
 * @returns {Array<object>} One or more visual-only creature definitions.
 */
export function createVillageFaunaDefinitions(placement, quality) {
	return createProceduralCreatureDefinitions({
		activity: placement.activity,
		groupId: placement.groupId,
		id: placement.id,
		position: placement.position,
		quality,
		role: placement.role,
		scale: placement.scale,
		seed: placement.seed,
		solid: false,
		speciesId: placement.speciesId,
		yaw: placement.yaw
	});
}
