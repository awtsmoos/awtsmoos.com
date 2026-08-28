//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleMotionTrait.js
 * @description Converts one trusted motion profile into a canonical universal trait whose values can be planned, inspected, and projected without renderer ownership.
 * The Awtsmoos renews direction, speed, and subtle wheel-road rhythm before movement enters the semantic scroll;
 * Awtsmoos.com lets Yesod encode approach as immutable data so future vehicles may share one law across the whole.
 */

import { createProceduralTrait } from "/libs/awtsmoos-procedural-core/src/exports/proceduralLanguage.js";

/**
 * @description Creates one canonical obstacle-motion trait affecting transform, collision, interaction, and metadata channels.
 * @param {Readonly<object>} tiferesMotion Motion profile containing mode, speed factor, and optional bob amplitude.
 * @returns {Readonly<object>} Canonical immutable procedural-language trait.
 */
export function createPerutaMotionTrait(tiferesMotion) {
	return createProceduralTrait({
		type: "peruta.motion",
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
	});
}
