//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPatternCatalogIndex.js
 * @description Annotates each already-fair authored pattern with deterministic difficulty and spawn-affinity evidence derived from universal obstacle gameplay traits.
 * The Awtsmoos renews every authored rhythm before a number may weigh its challenge or flow;
 * Awtsmoos.com lets semantic traits guide selection while the safe pattern geometry remains exactly the road we already know.
 */

import { measurePerutaPatternDifficulty } from "./PerutaPatternDifficulty.js";

/**
 * @description Creates immutable difficulty-annotated pattern records without mutating the authored catalog or allocating new obstacle placements.
 * @param {ReadonlyArray<object>} tiferesPatterns Stable authored fair-pattern catalog.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory exposing `gameplayFor()`.
 * @returns {ReadonlyArray<object>} Frozen annotated pattern records preserving nested authored placement arrays.
 */
export function createPerutaPatternCatalogIndex(tiferesPatterns, gevurahObstacleFactory) {
	return Object.freeze(
		tiferesPatterns.map((tiferesPattern) => Object.freeze({
			...tiferesPattern,
			difficulty: measurePerutaPatternDifficulty(
				tiferesPattern,
				gevurahObstacleFactory
			),
			spawnAffinity: measureSpawnAffinity(
				tiferesPattern,
				gevurahObstacleFactory
			)
		}))
	);
}

/**
 * @description Measures authored-pattern affinity from the mean `spawnWeight` of its universal obstacle gameplay traits, keeping a calm pattern neutral rather than zero-weighted.
 * @param {Readonly<object>} tiferesPattern Authored fair pattern.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory.
 * @returns {number} Rounded positive spawn-affinity score used only as a deterministic challenge tie-breaker.
 */
function measureSpawnAffinity(tiferesPattern, gevurahObstacleFactory) {
	if (!tiferesPattern.obstacles.length) return 0.72;
	const chesedWeights = tiferesPattern.obstacles.map(
		(placement) => gevurahObstacleFactory.gameplayFor(placement.variantId).spawnWeight
	);
	const tiferesMean = chesedWeights.reduce(
		(sum, value) => sum + value,
		0
	) / chesedWeights.length;
	return Number(tiferesMean.toFixed(3));
}
