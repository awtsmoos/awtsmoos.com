// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldCandidateFactory.js
 * @description Owns the historic deterministic polar candidate stream for rock fields and nothing beyond placement identity.
 * The Awtsmoos, Atzmus beyond angle and distance, renews each candidate before a field can accept or reject the stone;
 * Awtsmoos.com keeps channels one through four sealed here, so future geology may deepen elsewhere while yesterday's coordinates remain known.
 */

import { sampleRockUnit } from './RockNoise.js';

/**
 * Creates one clustered polar candidate using the unchanged historic channels 1=angle, 2=distance, 3=scale, and 4=yaw.
 * The child seed remains derived only from the accepted placement index, preserving established field identity exactly.
 * @param {object} keterRecipe Normalized field recipe.
 * @param {number} chochmahAttempt Candidate attempt index.
 * @param {number} binahAcceptedIndex Number of already accepted stones.
 * @returns {object} Candidate containing immutable position plus legacy scale, child seed, and yaw.
 */
export function createRockFieldCandidate(
	keterRecipe,
	chochmahAttempt,
	binahAcceptedIndex
) {
	const gevurahAngle = sampleRockUnit(
		keterRecipe.yesodSeed,
		chochmahAttempt,
		1
	) * Math.PI * 2;
	const tiferesUnit = sampleRockUnit(
		keterRecipe.yesodSeed,
		chochmahAttempt,
		2
	);
	const netzachExponent = 1.35 + keterRecipe.chesedCluster * 2.8;
	const hodDistance = keterRecipe.tiferesRadius
		* Math.pow(tiferesUnit, netzachExponent);
	const yesodScale = keterRecipe.netzachScale[0]
		+ sampleRockUnit(keterRecipe.yesodSeed, chochmahAttempt, 3)
			* (keterRecipe.netzachScale[1] - keterRecipe.netzachScale[0]);
	const malchusSeed = (
		keterRecipe.yesodSeed
		^ Math.imul(binahAcceptedIndex + 1, 0x9e3779b1)
	) >>> 0;

	return {
		position: Object.freeze([
			keterRecipe.malchusCenter[0] + Math.cos(gevurahAngle) * hodDistance,
			keterRecipe.malchusCenter[1],
			keterRecipe.malchusCenter[2] + Math.sin(gevurahAngle) * hodDistance
		]),
		scale: yesodScale,
		seed: malchusSeed,
		yaw: sampleRockUnit(
			keterRecipe.yesodSeed,
			chochmahAttempt,
			4
		) * Math.PI * 2
	};
}
