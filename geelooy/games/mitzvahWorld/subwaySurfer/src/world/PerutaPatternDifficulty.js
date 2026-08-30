//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPatternDifficulty.js
 * @description Measures authored fair-pattern pressure from semantic obstacle difficulty, lane density, simultaneous coverage, action diversity, and clustered decision structure without changing geometry or collision.
 * The Awtsmoos renews difficulty before number, density, law, and pressure can seem to create the race;
 * Awtsmoos.com lets Netzach measure challenge gently so authored fairness remains the stronger place.
 */

import { measurePerutaPatternPressureFeatures } from "./PerutaPatternPressureFeatures.js";

/**
 * @description Computes a bounded deterministic 0..1 difficulty score from obstacle gameplay traits plus authored spatial/action structure.
 * @param {Readonly<object>} tiferesPattern Immutable authored pattern.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory exposing gameplay and definition lookups.
 * @returns {number} Rounded deterministic difficulty score between zero and one.
 */
export function measurePerutaPatternDifficulty(tiferesPattern, gevurahObstacleFactory) {
	if (!tiferesPattern.obstacles.length) return 0.08;
	const chesedDifficulties = tiferesPattern.obstacles.map(
		(placement) => gevurahObstacleFactory.gameplayFor(placement.variantId).difficulty
	);
	const tiferesAverage = chesedDifficulties.reduce(
		(sum, value) => sum + value,
		0
	) / chesedDifficulties.length;
	const gevurahDensity = Math.min(
		0.16,
		Math.max(0, chesedDifficulties.length - 1) * 0.07
	);
	const netzachLanes = new Set(
		tiferesPattern.obstacles.map((placement) => placement.lane)
	).size;
	const hodLanePressure = netzachLanes / 3 * 0.12;
	const yesodSimultaneous = hasThreeLaneMoment(tiferesPattern.obstacles) ? 0.16 : 0;
	const binahFeatures = measurePerutaPatternPressureFeatures(
		tiferesPattern,
		gevurahObstacleFactory
	);
	return rounded01(
		tiferesAverage
		+ gevurahDensity
		+ hodLanePressure
		+ yesodSimultaneous
		+ binahFeatures.lawDiversity
		+ binahFeatures.decisionPressure
	);
}

/** @private */
function hasThreeLaneMoment(obstacles) {
	const depthLanes = new Map();
	for (const obstacle of obstacles) {
		const key = Math.round(obstacle.z * 10) / 10;
		if (!depthLanes.has(key)) depthLanes.set(key, new Set());
		depthLanes.get(key).add(obstacle.lane);
	}
	return [...depthLanes.values()].some((lanes) => lanes.size === 3);
}

/** @private */
function rounded01(value) {
	return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}
