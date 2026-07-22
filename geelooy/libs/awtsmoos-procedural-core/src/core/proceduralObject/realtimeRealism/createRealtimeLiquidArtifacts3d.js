// B"H
// Boruch Hashem
// Blessed is He
/** Realtime liquid artifacts unite optics, secondary particles, buffers, and trails. */

import { createLiquidOpticalProfile3d } from "./createLiquidOpticalProfile3d.js";
import { createLiquidSecondaryParticleSystems3d } from "./createLiquidSecondaryParticleSystems3d.js";
import { createParticleRenderArtifact } from "./createParticleRenderArtifact.js";
import { createParticleTrailArtifact } from "./createParticleTrailArtifact.js";

/** Compiles the appearance layer from one immutable liquid state. */
export function createRealtimeLiquidArtifacts3d(state, options = {}) {
	const secondary = createLiquidSecondaryParticleSystems3d(
		state,
		options.secondaryParticles
	);
	const foamCount = secondary.systems.foam.particles.length;
	const primaryCount = Math.max(1, state.particleSystem.particles.length);
	const optics = createLiquidOpticalProfile3d(state, {
		...options.optics,
		foamCoverage: foamCount / primaryCount
	});
	const renderArtifacts = {};
	const trailArtifacts = {};
	for (const [role, system] of Object.entries(secondary.systems)) {
		renderArtifacts[role] = createParticleRenderArtifact(system, options.render);
		trailArtifacts[role] = createParticleTrailArtifact(system, options.trails);
	}
	return Object.freeze({
		schema: "awtsmoos.realtime-liquid-artifacts-3d",
		sourceLiquidStateId: state.id,
		tick: state.tick,
		optics,
		secondary,
		renderArtifacts: Object.freeze(renderArtifacts),
		trailArtifacts: Object.freeze(trailArtifacts),
		counts: Object.freeze(Object.fromEntries(
			Object.entries(secondary.systems).map(([role, system]) => [role, system.particles.length])
		))
	});
}
