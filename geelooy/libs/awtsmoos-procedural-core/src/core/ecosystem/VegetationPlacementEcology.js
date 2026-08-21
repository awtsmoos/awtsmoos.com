// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPlacementEcology.js
 * @description Manifests patch ecology as spacing, age coherence, scale, and placement evidence without owning population search.
 * The Awtsmoos, Atzmus beyond every crowded root and open edge, renews the plant and the room around it in one creation;
 * Awtsmoos.com lets this Malchus-like vessel receive ecological evidence while the population planner remains the choosing mind.
 */

import { ecosystemSeed } from './EcosystemRandom.js';
import { normalizeScale } from './PopulationSelection.js';

/**
 * Computes lawful spacing for a candidate while preserving the legacy uniform path exactly.
 * @param {object} species Selected ecological species record.
 * @param {object} candidate Patch-field candidate.
 * @param {number} defaultSpacing Planner minimum spacing.
 * @returns {number} Positive placement spacing.
 */
export function vegetationCandidateSpacing(species, candidate, defaultSpacing) {
	const baseSpacing = Math.max(defaultSpacing, finite(species.spacing, defaultSpacing));
	if (!candidate.patchId) return baseSpacing;
	return Math.max(0.05, baseSpacing * candidate.ecology.spacingScale);
}

/**
 * Creates one immutable vegetation placement while consuming the same random calls as the prior planner path.
 * @param {object} species Selected species.
 * @param {object} candidate Patch-field candidate.
 * @param {object} habitat Canonical habitat sample.
 * @param {object} options Population options.
 * @param {*} random Existing deterministic EcosystemRandom.
 * @param {number} index Accepted placement index.
 * @param {number} attempt Current candidate-attempt index.
 * @returns {object} Frozen ecological placement record.
 */
export function createVegetationPlacement(
	species,
	candidate,
	habitat,
	options,
	random,
	index,
	attempt
) {
	const scaleRange = normalizeScale(species.scale);
	const age = candidate.patchId
		? coherentPatchAge(candidate, random.range(-0.12, 0.12))
		: random.range(0.18, 1);
	const sampledScale = random.range(scaleRange[0], scaleRange[1]);
	const scale = candidate.patchId
		? ecologicalPatchScale(sampledScale, candidate)
		: sampledScale;
	return Object.freeze({
		age,
		habitat,
		id: `${species.id}:${index}:${ecosystemSeed(options.seed, attempt)}`,
		patchEcology: candidate.ecology,
		patchId: candidate.patchId,
		scale,
		speciesId: species.id,
		x: candidate.x,
		y: finite(options.heightAt?.(candidate.x, candidate.z), 0),
		yaw: random.range(-Math.PI, Math.PI),
		z: candidate.z
	});
}

function coherentPatchAge(candidate, ageNoise) {
	const noisyAge = clamp(candidate.ageBias + ageNoise, 0.08, 1);
	const coherence = candidate.ecology.maturityCoherence;
	return clamp(candidate.ageBias * coherence + noisyAge * (1 - coherence), 0.08, 1);
}

function ecologicalPatchScale(sampledScale, candidate) {
	const ecology = candidate.ecology;
	const ecologyScale = 0.94
		+ ecology.openingExposure * 0.08
		- ecology.competition * 0.04;
	return sampledScale * candidate.scaleBias * ecologyScale;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
