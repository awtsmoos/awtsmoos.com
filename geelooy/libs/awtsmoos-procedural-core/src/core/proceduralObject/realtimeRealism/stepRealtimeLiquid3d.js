// B"H
// Boruch Hashem
// Blessed is He
/** One call advances liquid physics and renews its derived visual phenomena. */

import { stepParticleGridLiquid3d } from "../liquid3d/stepParticleGridLiquid3d.js";
import { createRealtimeLiquidArtifacts3d } from "./createRealtimeLiquidArtifacts3d.js";

/**
 * Advances PIC/FLIP state and compiles instant renderer-neutral realism artifacts.
 * @param {Object} state - Canonical liquid state or creation input.
 * @param {Object} options - Physics and realism policies.
 * @returns {Object} Next state, surface, report, and visual artifacts.
 */
export function stepRealtimeLiquid3d(state, options = {}) {
	const result = stepParticleGridLiquid3d(state, options.physics ?? options);
	return Object.freeze({
		...result,
		realism: createRealtimeLiquidArtifacts3d(
			result.state,
			options.realism ?? options
		)
	});
}
