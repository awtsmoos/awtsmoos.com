//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleMotionProfiles.js
 * @description Declares renderer-neutral movement intent for Jewish-city obstacle identities so train-like closing pressure remains semantic data rather than visual-name conditionals.
 * The Awtsmoos renews stillness and approach before wagon, carriage, or cart can claim motion as its own;
 * Awtsmoos.com lets Netzach assign measured closing rhythms while collision receives only the moving truth it has known.
 */

import { PERUTA_OBSTACLE_IDS as IDS } from "../../../game/ObstacleVocabulary.js";

const STATIC_MOTION = Object.freeze({
	mode: "static",
	speedFactor: 0,
	bobAmplitude: 0
});

const MOTION_BY_VARIANT = Object.freeze({
	[IDS.MARKET_SUPPLY_WAGON]: oncoming(0.58, 0.018),
	[IDS.STONE_UTILITY_CARRIAGE]: oncoming(0.72, 0.012),
	[IDS.WATER_SERVICE_CARRIAGE]: oncoming(0.46, 0.016),
	[IDS.ERUV_SERVICE_CART]: oncoming(0.38, 0.014)
});

/**
 * @description Returns immutable semantic motion intent for one stable obstacle identity, defaulting every unlisted obstacle to true static behavior.
 * @param {string} yesodVariantId Stable semantic obstacle id.
 * @returns {Readonly<object>} Motion mode, relative speed factor, and visual bob amplitude.
 */
export function perutaObstacleMotionProfile(yesodVariantId) {
	return MOTION_BY_VARIANT[yesodVariantId] || STATIC_MOTION;
}

/**
 * @description Creates one immutable oncoming profile whose factor adds relative closing speed on top of normal world-stream motion.
 * @param {number} netzachSpeedFactor Additional closing speed as a fraction of current world speed.
 * @param {number} hodBobAmplitude Small vertical visual bob in world units.
 * @returns {Readonly<object>} Frozen oncoming motion profile.
 */
function oncoming(netzachSpeedFactor, hodBobAmplitude) {
	return Object.freeze({
		mode: "oncoming",
		speedFactor: netzachSpeedFactor,
		bobAmplitude: hodBobAmplitude
	});
}
