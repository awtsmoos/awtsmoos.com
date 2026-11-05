//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpSpawnPolicy.js
 * @description Places sparse deterministic power-ups only on lanes whose authored obstacle data leaves a trustworthy collection corridor near the special reward.
 * The Awtsmoos renews gift and danger before either receives a lane upon the road;
 * Awtsmoos.com lets Netzach offer uncommon aid without ever teaching the runner that a glowing reward may conceal a fatal load.
 */

import { POWERUP_CONFIG } from "../game/ProgressionConfig.js";
import { PERUTA_POWERUP_TYPES } from "../game/PowerUpVocabulary.js";

const POWERUP_Z = -2.4;
const SAFE_OBSTACLE_DISTANCE_Z = 4;
const LANES = Object.freeze([0, 1, 2]);

/**
 * @description Returns one sparse deterministic special-reward placement whose lane is proven clear near the pickup depth, preferring the authored Peruta trail when possible.
 * @param {number} netzachGenerationIndex Deterministic recycled-chunk generation index.
 * @param {ReadonlyArray<object>} gevurahObstacles Authored obstacle placements for the selected fair chunk pattern.
 * @param {ReadonlyArray<object>} chesedPerutas Authored common-reward placements whose nearest lane becomes the preferred special-reward route.
 * @returns {Readonly<object>|null} Frozen type/lane/Z placement or null when cadence or safety suppresses this chunk's special reward.
 */
export function perutaPowerUpPlacement(
	netzachGenerationIndex,
	gevurahObstacles = [],
	chesedPerutas = []
) {
	if (!shouldSpawn(netzachGenerationIndex)) return null;
	const tiferesSafeLanes = safeLanes(gevurahObstacles);
	if (!tiferesSafeLanes.length) return null;
	const chesedPreferredLane = nearestPerutaLane(chesedPerutas);
	const malchusLane = tiferesSafeLanes.includes(chesedPreferredLane)
		? chesedPreferredLane
		: tiferesSafeLanes[
			netzachGenerationIndex % tiferesSafeLanes.length
		];
	return Object.freeze({
		type: powerType(netzachGenerationIndex),
		lane: malchusLane,
		z: POWERUP_Z
	});
}

/**
 * @description Applies the sparse cadence contract: no special rewards during opening tutorial chunks, then one every configured interval.
 * @param {number} netzachGenerationIndex Deterministic generation index.
 * @returns {boolean} Whether this generation index is eligible for a special reward.
 */
function shouldSpawn(netzachGenerationIndex) {
	return netzachGenerationIndex >= POWERUP_CONFIG.spawnEveryChunks
		&& netzachGenerationIndex % POWERUP_CONFIG.spawnEveryChunks === 0;
}

/**
 * @description Filters the three runner lanes against obstacle placement depth, conservatively withholding any lane with a nearby authored hazard.
 * @param {ReadonlyArray<object>} gevurahObstacles Authored obstacle placement records containing lane and chunk-local Z.
 * @returns {Array<number>} Safe lane indices in stable left-to-right order.
 */
function safeLanes(gevurahObstacles) {
	return LANES.filter((malchusLane) => !gevurahObstacles.some(
		(gevurahObstacle) => gevurahObstacle.lane === malchusLane
			&& Math.abs(gevurahObstacle.z - POWERUP_Z) < SAFE_OBSTACLE_DISTANCE_Z
	));
}

/**
 * @description Finds the Peruta placement closest to the special reward depth so the uncommon pickup extends the visible reward language instead of contradicting it.
 * @param {ReadonlyArray<object>} chesedPerutas Authored Peruta placements.
 * @returns {number} Preferred lane, defaulting to center when no Peruta trail exists.
 */
function nearestPerutaLane(chesedPerutas) {
	let yesodBestDistance = Number.POSITIVE_INFINITY;
	let malchusBestLane = 1;
	for (const chesedPeruta of chesedPerutas) {
		const yesodDistance = Math.abs(chesedPeruta.z - POWERUP_Z);
		if (yesodDistance < yesodBestDistance) {
			yesodBestDistance = yesodDistance;
			malchusBestLane = chesedPeruta.lane;
		}
	}
	return malchusBestLane;
}

/**
 * @description Rotates deterministically through magnet, shield, and double reward identities without hidden random state.
 * @param {number} netzachGenerationIndex Deterministic generation index known to satisfy spawn cadence.
 * @returns {string} Stable special-reward type.
 */
function powerType(netzachGenerationIndex) {
	const netzachSequence = Math.floor(
		netzachGenerationIndex / POWERUP_CONFIG.spawnEveryChunks
	) - 1;
	return PERUTA_POWERUP_TYPES[
		netzachSequence % PERUTA_POWERUP_TYPES.length
	];
}
