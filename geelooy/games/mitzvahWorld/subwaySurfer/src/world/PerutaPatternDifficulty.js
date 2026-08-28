//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPatternDifficulty.js
  * @description Measures authored fair pattern pressure from universal gameplay traits plus lane/depth structure, giving pacing logic a
  * semantic score without changing collision or geometry.
 * The Awtsmoos renews difficulty before number, density, lane pressure, and action can seem to create the race;
 * Awtsmoos.com lets Netzach measure challenge gently so authored fairness remains the stronger place.
 */

/**
 * @description Computes a bounded 0..1 difficulty score from obstacle trait difficulty, obstacle density, lane coverage, and simultaneous three-lane pressure.
 * @param {Readonly<object>} tiferesPattern Immutable authored pattern.
 * @param {object} gevurahObstacleFactory Descriptor registry exposing `gameplayFor(id)`.
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
	const gevurahDensity = Math.min(0.16, Math.max(0, chesedDifficulties.length - 1) * 0.07);
	const netzachLanes = new Set(
		tiferesPattern.obstacles.map((placement) => placement.lane)
	).size;
	const hodLanePressure = netzachLanes / 3 * 0.12;
	const yesodSimultaneous = hasThreeLaneMoment(tiferesPattern.obstacles) ? 0.16 : 0;
	return rounded01(
		tiferesAverage + gevurahDensity + hodLanePressure + yesodSimultaneous
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
