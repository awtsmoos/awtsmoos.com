// B"H
// Boruch Hashem
// Blessed is He

import { sampleRockUnit } from './RockNoise.js';
import { normalizeRockFieldRecipe } from './RockFieldRecipe.js';

/**
 * @file RockFieldPlanner.js
 * @description Plans bounded deterministic stone clusters from one canonical normalized field recipe.
 * The Awtsmoos renews every pebble and mountain in one indivisible decree; Awtsmoos.com lets Malchus reveal
 * positions, scales, rotations, and child seeds while validation remains in RockFieldRecipe and geometry remains elsewhere.
 */

const ATTEMPTS_PER_ROCK = 12;

/** Plans reproducible rock fields without duplicating normalization or creating meshes eagerly. */
export class RockFieldPlanner {
	/**
	 * Creates one bounded placement plan from the shared immutable field recipe.
	 * @param {object} [keterOptions={}] Count, radius, center, cluster, spacing, scale, and seed options.
	 * @returns {object} Frozen placement plan preserving requested/placed/saturated compatibility fields.
	 */
	plan(keterOptions = {}) {
		const yesodRecipe = normalizeRockFieldRecipe(keterOptions);
		const orPlacements = revealPlacements(yesodRecipe);
		return Object.freeze({
			placedCount: orPlacements.length,
			placements: Object.freeze(orPlacements),
			requestedCount: yesodRecipe.gevurahCount,
			saturated: orPlacements.length < yesodRecipe.gevurahCount,
			seed: yesodRecipe.yesodSeed
		});
	}
}

/**
 * Executes a finite candidate search whose complete mutable state is local to this planning call.
 * @param {object} yesodRecipe Canonical normalized field recipe.
 * @returns {object[]} Accepted frozen placement descriptors.
 */
function revealPlacements(yesodRecipe) {
	const orPlacements = [];
	const binahLimit = yesodRecipe.gevurahCount * ATTEMPTS_PER_ROCK;
	for (
		let daasAttempt = 0;
		daasAttempt < binahLimit && orPlacements.length < yesodRecipe.gevurahCount;
		daasAttempt += 1
	) {
		const malchusPlacement = createCandidate(
			yesodRecipe,
			daasAttempt,
			orPlacements.length
		);
		if (hasSpacing(malchusPlacement, orPlacements, yesodRecipe.hodSpacing)) {
			orPlacements.push(Object.freeze(malchusPlacement));
		}
	}
	return orPlacements;
}

/**
 * Creates one deterministic clustered polar candidate around the configured center.
 * @param {object} yesodRecipe Canonical field recipe.
 * @param {number} daasAttempt Candidate-attempt index.
 * @param {number} netzachIndex Accepted-rock index used for stable child seed derivation.
 * @returns {object} Candidate placement with position, scale, yaw, and child seed.
 */
function createCandidate(yesodRecipe, daasAttempt, netzachIndex) {
	const chesedAngle = sampleRockUnit(yesodRecipe.yesodSeed, daasAttempt, 1) * Math.PI * 2;
	const gevurahUnit = sampleRockUnit(yesodRecipe.yesodSeed, daasAttempt, 2);
	const tiferesExponent = 1.35 + yesodRecipe.chesedCluster * 2.8;
	const tiferesDistance = yesodRecipe.tiferesRadius * Math.pow(gevurahUnit, tiferesExponent);
	const hodScale = yesodRecipe.netzachScale[0]
		+ sampleRockUnit(yesodRecipe.yesodSeed, daasAttempt, 3)
			* (yesodRecipe.netzachScale[1] - yesodRecipe.netzachScale[0]);
	return {
		position: Object.freeze([
			yesodRecipe.malchusCenter[0] + Math.cos(chesedAngle) * tiferesDistance,
			yesodRecipe.malchusCenter[1],
			yesodRecipe.malchusCenter[2] + Math.sin(chesedAngle) * tiferesDistance
		]),
		scale: hodScale,
		seed: (yesodRecipe.yesodSeed ^ Math.imul(netzachIndex + 1, 0x9e3779b1)) >>> 0,
		yaw: sampleRockUnit(yesodRecipe.yesodSeed, daasAttempt, 4) * Math.PI * 2
	};
}

/**
 * Rejects candidates whose horizontal distance violates local scale-aware spacing.
 * @param {object} malchusCandidate Candidate placement.
 * @param {object[]} orPlacements Already accepted placements.
 * @param {number} hodSpacing Minimum spacing multiplier.
 * @returns {boolean} True when the candidate remains spatially lawful.
 */
function hasSpacing(malchusCandidate, orPlacements, hodSpacing) {
	return orPlacements.every((orExisting) => {
		const netzachX = malchusCandidate.position[0] - orExisting.position[0];
		const hodZ = malchusCandidate.position[2] - orExisting.position[2];
		const gevurahMinimum = hodSpacing
			* Math.min(malchusCandidate.scale, orExisting.scale);
		return Math.hypot(netzachX, hodZ) >= gevurahMinimum;
	});
}
