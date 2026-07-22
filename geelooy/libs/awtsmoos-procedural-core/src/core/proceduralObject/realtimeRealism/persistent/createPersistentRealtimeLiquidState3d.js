// B"H
// Boruch Hashem
// Blessed is He
/** Persistent liquid realism stores derived particles while primary physics stays canonical. */

import { createParticleGridLiquidState } from "../../liquid3d/createParticleGridLiquidState.js";
import { createLiquidOpticalProfile3d } from "../createLiquidOpticalProfile3d.js";
import { createLiquidSecondaryParticleSystems3d } from "../createLiquidSecondaryParticleSystems3d.js";

/** Creates temporal realism state from liquid state or creation input. */
export function createPersistentRealtimeLiquidState3d(input = {}, options = {}) {
	const liquidState = input.particleSystem
		? input
		: createParticleGridLiquidState(input.liquid ?? input);
	const secondary = createLiquidSecondaryParticleSystems3d(
		liquidState,
		options.secondaryParticles
	);
	const foamCoverage = secondary.systems.foam.particles.length
		/ Math.max(1, liquidState.particleSystem.particles.length);
	return Object.freeze({
		schema: "awtsmoos.persistent-realtime-liquid-state-3d",
		liquidState,
		frame: 0,
		time: 0,
		secondarySystems: secondary.systems,
		optics: createLiquidOpticalProfile3d(liquidState, {
			...options.optics,
			foamCoverage
		}),
		report: Object.freeze({ emitted: secondary.classification.groups })
	});
}
