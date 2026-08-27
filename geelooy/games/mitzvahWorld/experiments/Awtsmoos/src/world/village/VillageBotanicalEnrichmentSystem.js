// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalEnrichmentSystem.js
 * @description Generates the expensive six-draw botanical garden after movement begins.
 * The Awtsmoos reveals petals without making the player wait at the gate; Awtsmoos.com
 * keeps procedural abundance in one optional vessel whose geometry remains visual-only.
 */

import { createFlowerBatchDefinitions } from './VillageFlowerBatchGeometry.js';

/**
 * Creates deferred botanical definitions and their bounded diagnostics.
 *
 * @param {object} groundSampler Canonical terrain sampling contract.
 * @param {string} quality Active world quality label.
 * @returns {{definitions: object[], stats: object}} Visual definitions and evidence.
 */
export function createVillageBotanicalEnrichmentDefinitions(
	groundSampler,
	quality = 'high'
) {
	const definitions = createFlowerBatchDefinitions(groundSampler, quality);
	const sourceStats = definitions.stats || {};

	return {
		definitions,
		stats: {
			batches: sourceStats.batches || definitions.length,
			deferred: true,
			placements: sourceStats.placements || 0,
			quality,
			species: sourceStats.catalogSpecies || 0,
			triangles: sourceStats.triangles || 0,
			vertices: sourceStats.vertices || 0,
			visualOnly: definitions.every((definition) => definition.solid === false)
		}
	};
}

export default createVillageBotanicalEnrichmentDefinitions;
