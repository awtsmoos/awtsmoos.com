// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockClusterMember.js
 * @description Materializes one planned rock member and its environmental evidence while keeping cluster coordination small.
 * The Awtsmoos, Atzmus beyond member and multitude, renews each stone before the field can count it as one;
 * Awtsmoos.com lets this Malchus vessel join placement, ecology, and canonical Domem artifact without duplicating the geology from which it has begun.
 */

import { createRealityRock } from './RealityRockProfile.js';
import { createRealityRockSurfaceEvidence } from './RealityRockSurfaceEvidence.js';

/**
 * Creates one immutable cluster member from a deterministic placement.
 * @param {Readonly<object>} placementMalchus Planned placement record.
 * @param {Readonly<object>} optionsBinah Normalized cluster options.
 * @param {Readonly<object>} mergedChesed Raw merged caller intent used only for canonical specialist overrides.
 * @returns {Readonly<object>} Frozen member with placement, surface evidence, and optional canonical rock artifact.
 */
export function createRealityRockClusterMember(placementMalchus, optionsBinah, mergedChesed) {
	const surfaceHod = createRealityRockSurfaceEvidence(placementMalchus, mergedChesed.environment);
	const rockDomem = optionsBinah.mode === 'placements'
		? null
		: createRealityRock({
			collision: mergedChesed.collision,
			condition: mergedChesed.condition,
			deformation: mergedChesed.deformation,
			detail: optionsBinah.detail,
			geology: optionsBinah.geology,
			materialRole: mergedChesed.materialRole,
			remoteTexture: mergedChesed.remoteTexture,
			scale: placementMalchus.scale,
			seed: placementMalchus.seed,
			semantic: mergedChesed.semantic
		});
	return Object.freeze({
		id: placementMalchus.id,
		placement: placementMalchus,
		rock: rockDomem,
		surfaceEvidence: surfaceHod
	});
}

/**
 * Creates adapter-neutral batching guidance from population size and generation mode.
 * @param {Readonly<object>} optionsBinah Normalized cluster options.
 * @param {number} populationNetzach Placed member count.
 * @returns {Readonly<object>} Frozen render guidance that claims no renderer capability.
 */
export function createRealityRockRenderHint(optionsBinah, populationNetzach) {
	return Object.freeze({
		batchCandidate: populationNetzach >= 4,
		preferredPopulationMode: optionsBinah.mode === 'placements'
			? 'instance-or-lod'
			: 'semantic-batching',
		stablePlacements: true
	});
}
