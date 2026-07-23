// B"H
// Boruch Hashem
// Blessed is He
/** Persistent liquid realism stores derived particles while primary physics stays canonical. */

import { createParticleGridLiquidState } from "../../liquid3d/createParticleGridLiquidState.js";
import { createLiquidOpticalProfile3d } from "../createLiquidOpticalProfile3d.js";
import { createLiquidSecondaryParticleSystems3d } from "../createLiquidSecondaryParticleSystems3d.js";
import { compilePersistentLiquidRenderArtifacts3d } from "./compilePersistentLiquidRenderArtifacts3d.js";

/** Creates temporal realism state from liquid state or creation input. */
export function createPersistentRealtimeLiquidState3d(input = {}, options = {}) {
	const liquidState = input.particleSystem
		? input
		: createParticleGridLiquidState(input.liquid ?? input);
	const secondary = createLiquidSecondaryParticleSystems3d(liquidState, options.secondaryParticles);
	const systems = secondary.systems;
	const primaryCount = Math.max(1, liquidState.particleSystem.particles.length);
	const optics = createLiquidOpticalProfile3d(liquidState, {
		...options.optics,
		foamCoverage: systems.foam.particles.length / primaryCount
	});
	const render = compilePersistentLiquidRenderArtifacts3d(systems, options);
	return Object.freeze({
		schema: "awtsmoos.persistent-realtime-liquid-state-3d",
		liquidState,
		frame: 0,
		time: 0,
		secondarySystems: systems,
		optics,
		render,
		report: Object.freeze({
			emitted: Object.freeze(Object.fromEntries(
				Object.entries(systems).map(([role, system]) => [role, system.particles.length])
			)),
			counts: render.counts
		})
	});
}
