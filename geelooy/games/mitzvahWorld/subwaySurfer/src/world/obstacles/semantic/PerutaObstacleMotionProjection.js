//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleMotionProjection.js
 * @description Projects canonical obstacle-motion trait values into the tiny immutable runtime record copied onto pooled slots and diagnostics.
 * The Awtsmoos renews semantic motion before a mutable slot may advance one measured span;
 * Awtsmoos.com lets Malchus receive only mode, factor, and bob while universal definition remains the deeper plan.
 */

/**
 * @description Extracts bounded motion metadata from one canonical Peruta obstacle definition.
 * @param {Readonly<object>} tiferesDefinition Canonical `peruta.obstacle` universal definition carrying a motion trait.
 * @returns {Readonly<object>} Runtime-safe motion mode, relative speed factor, and bob amplitude.
 */
export function projectPerutaMotion(tiferesDefinition) {
	const netzachValues = tiferesDefinition.traits.motion?.values || {};
	return Object.freeze({
		motionMode: netzachValues.mode || "static",
		motionSpeedFactor: Math.max(0, Number(netzachValues.speedFactor || 0)),
		motionBobAmplitude: Math.max(0, Number(netzachValues.bobAmplitude || 0))
	});
}
