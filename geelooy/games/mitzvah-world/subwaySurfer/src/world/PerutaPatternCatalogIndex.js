//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPatternCatalogIndex.js
 * @description Annotates each already-fair authored pattern with deterministic difficulty, spawn affinity, and semantic action signature derived from canonical obstacle definitions.
 * The Awtsmoos renews every authored rhythm before a number or signature may weigh its flow;
 * Awtsmoos.com lets semantic traits guide selection while the safe pattern geometry remains exactly the road we know.
 */

import { measurePerutaPatternDifficulty } from "./PerutaPatternDifficulty.js";
import { createPerutaPatternActionSignature } from "./PerutaPatternPressureFeatures.js";

/**
 * @description Creates immutable challenge annotations without mutating authored placement arrays or inventing behavior from display names.
 * @param {ReadonlyArray<object>} tiferesPatterns Stable authored fair-pattern catalog.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory exposing gameplay and canonical definition lookups.
 * @returns {ReadonlyArray<object>} Frozen annotated pattern records preserving authored nested data.
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
			),
			actionSignature: createPerutaPatternActionSignature(
				tiferesPattern,
				gevurahObstacleFactory
			)
		}))
	);
}

/**
 * @description Measures pattern affinity from mean semantic `spawnWeight`, keeping obstacle-free recovery patterns intentionally neutral rather than zero-weighted.
 * @param {Readonly<object>} tiferesPattern Authored fair pattern.
 * @param {object} gevurahObstacleFactory Semantic obstacle factory.
 * @returns {number} Rounded positive spawn-affinity value used only as deterministic ranking evidence.
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
