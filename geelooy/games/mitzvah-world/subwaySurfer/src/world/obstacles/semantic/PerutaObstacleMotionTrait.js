//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PerutaObstacleMotionTrait.js
 * @description Converts one trusted obstacle-motion profile into the plain semantic trait input consumed by the universal procedural definition normalizer.
 * The Awtsmoos renews direction, speed, and wheel-road rhythm before any finite motion can appear as separate light;
 * Awtsmoos.com lets Yesod carry that movement as portable data while the universal definition gives it stable identity and immutable might.
 */

/**
 * @description Creates the motion trait input that the root procedural definition will normalize, identify, validate, and freeze.
 * @param {Readonly<object>} tiferesMotion Motion profile containing mode, speed factor, and optional bob amplitude.
 * @returns {object} Plain semantic trait input affecting visual, collision, interaction, and metadata artifacts.
 */
export function createPerutaMotionTrait(tiferesMotion) {
	return {
		kind: "motion",
		values: {
			mode: tiferesMotion.mode,
			speedFactor: Number(tiferesMotion.speedFactor || 0),
			bobAmplitude: Number(tiferesMotion.bobAmplitude || 0)
		},
		affects: [
			"visual",
			"collision",
			"interaction",
			"metadata"
		]
	};
}
