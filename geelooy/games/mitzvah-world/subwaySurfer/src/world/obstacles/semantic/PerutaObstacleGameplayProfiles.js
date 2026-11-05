//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleGameplayProfiles.js
 * @description Declares authored gameplay intent for every current Jewish-city obstacle while leaving geometry, collision math, and renderer ownership elsewhere.
 * The Awtsmoos renews challenge, teaching, reward, and rhythm before one wagon or awning enters the runner's day;
 * Awtsmoos.com lets gameplay balance become editable semantic data so future tuning changes numbers without rebuilding the visual way.
 */

import { PERUTA_OBSTACLE_IDS as IDS } from "../../../game/ObstacleVocabulary.js";

const PROFILES = Object.freeze({
	[IDS.MARKET_SUPPLY_WAGON]: profile(0.40, 1.00, "lane-change", 18, 9, 0.90),
	[IDS.STONE_UTILITY_CARRIAGE]: profile(0.58, 0.72, "lane-pressure", 26, 12, 0.72),
	[IDS.WATER_SERVICE_CARRIAGE]: profile(0.50, 0.82, "lane-change", 22, 10, 0.82),
	[IDS.PRODUCE_HANDCART]: profile(0.42, 1.05, "jump", 18, 9, 1.00),
	[IDS.MARKET_AWNING]: profile(0.48, 1.00, "duck", 20, 9, 1.00),
	[IDS.TIMBER_PALLET_BUNDLE]: profile(0.53, 0.92, "jump", 22, 11, 0.92),
	[IDS.REPAIR_CRATES]: profile(0.50, 0.88, "jump", 20, 10, 0.92),
	[IDS.TIMBER_LINTEL]: profile(0.56, 0.82, "duck", 24, 11, 0.86),
	[IDS.SCAFFOLD_BRACE]: profile(0.60, 0.76, "duck", 26, 12, 0.82),
	[IDS.ERUV_MAINTENANCE_GATEWAY]: profile(0.46, 1.00, "duck", 20, 9, 1.00),
	[IDS.ERUV_SERVICE_CART]: profile(0.51, 0.84, "lane-change", 22, 10, 0.88),
	[IDS.ERUV_MAINTENANCE_LADDER]: profile(0.54, 0.92, "jump", 22, 11, 0.92),
	[IDS.FOLDING_CHAIR_RACK]: profile(0.53, 0.86, "lane-change", 22, 10, 0.86),
	[IDS.COMMUNITY_CANOPY_BEAM]: profile(0.57, 0.82, "duck", 24, 11, 0.90),
	[IDS.CABLE_PROTECTOR_RAMP]: profile(0.47, 1.04, "jump", 18, 9, 1.00)
});

/**
 * @description Returns immutable authored gameplay intent for one stable obstacle id, falling back to a conservative neutral profile only for future unlisted variants.
 * @param {string} yesodVariantId Stable Peruta obstacle id.
 * @returns {Readonly<object>} Difficulty, spawn weight, tutorial role, near-miss value, minimum speed, and reward affinity.
 */
export function perutaObstacleGameplayProfile(yesodVariantId) {
	return PROFILES[yesodVariantId] || profile(0.5, 1, "general", 20, 9, 0.9);
}

/** @private */
function profile(difficulty, spawnWeight, tutorialRole, nearMissValue, minimumSpeed, rewardAffinity) {
	return Object.freeze({
		difficulty,
		spawnWeight,
		tutorialRole,
		nearMissValue,
		minimumSpeed,
		rewardAffinity
	});
}
