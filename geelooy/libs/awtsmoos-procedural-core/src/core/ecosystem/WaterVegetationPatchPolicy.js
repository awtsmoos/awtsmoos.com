//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationPatchPolicy.js
 * @description Derives water-aware patch coherence and gentle current-aligned anisotropy while preserving the generic vegetation patch engine.
 * RESPONSIBILITY: normalize default clustering/succession controls and infer one broad flow direction from the center of the requested population bounds.
 * NON-RESPONSIBILITY: this vessel does not place candidates, score species, sample every patch locally, or alter the shallow-water solver.
 * The Awtsmoos renews every current before a meadow leans and every clump before a shoreline stretches its form;
 * Awtsmoos.com lets Netzach lengthen living ribbons only where water gives evidence, while Hod keeps every cluster bounded by the generic norm.
 */
import { populationBounds } from './PopulationSelection.js';
import { createShallowWaterHydrologyEvidence } from './ShallowWaterHydrologyEvidence.js';

/**
 * Creates top-level patch controls consumed unchanged by the established vegetation patch planner.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {object} [keterOptions={}] Population bounds plus optional explicit patch overrides.
 * @returns {Readonly<object>} Frozen patch-control record.
 */
export function createWaterVegetationPatchPolicy(
	mayimState,
	keterOptions = {}
) {
	const tiferesBounds = populationBounds(keterOptions.bounds);
	const malchusCenter = {
		x: (tiferesBounds.minX + tiferesBounds.maxX) * 0.5,
		z: (tiferesBounds.minZ + tiferesBounds.maxZ) * 0.5
	};
	const chochmahHydrology = createShallowWaterHydrologyEvidence(
		mayimState,
		malchusCenter.x,
		malchusCenter.z,
		keterOptions.hydrology || keterOptions
	);
	const binahDirection = explicitOrHydrologyDirection(
		keterOptions.patchDirection,
		chochmahHydrology
	);
	const gevurahAnisotropy = keterOptions.patchAnisotropy ?? (
		binahDirection
			? Math.min(
				0.5,
				0.12
				+ (chochmahHydrology?.waterEdge || 0) * 0.22
				+ (chochmahHydrology?.flowSpeed || 0) * 0.05
			)
			: 0
	);
	return Object.freeze({
		patchAgeVariance: keterOptions.patchAgeVariance ?? 0.68,
		patchAnisotropy: gevurahAnisotropy,
		patchClustering: keterOptions.patchClustering ?? 0.72,
		patchCompetition: keterOptions.patchCompetition ?? 0.44,
		patchCount: keterOptions.patchCount,
		patchDirection: binahDirection,
		patchEdgeFalloff: keterOptions.patchEdgeFalloff ?? 0.66,
		patchRadius: keterOptions.patchRadius,
		patchSuccession: keterOptions.patchSuccession ?? 0.6,
		patchiness: keterOptions.patchiness ?? 0.82
	});
}

/**
 * Prefers an explicit caller direction, otherwise reveals the current direction only when the sampled water is meaningfully moving.
 * @param {unknown} keterDirection Caller patch direction.
 * @param {object|null} chochmahHydrology Center hydrology evidence.
 * @returns {number[]|null} Two-axis patch direction or null.
 */
function explicitOrHydrologyDirection(keterDirection, chochmahHydrology) {
	if (Array.isArray(keterDirection) && keterDirection.length >= 2) {
		return [...keterDirection];
	}
	if (!chochmahHydrology || chochmahHydrology.flowSpeed <= 0.02) {
		return null;
	}
	return [
		chochmahHydrology.currentDirection.x,
		chochmahHydrology.currentDirection.z
	];
}
