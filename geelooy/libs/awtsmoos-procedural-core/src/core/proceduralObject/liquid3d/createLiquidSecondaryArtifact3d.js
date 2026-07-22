// B"H
// Boruch Hashem
// Blessed is He
/**
 * Foam, spray, and bubbles are secondary witnesses of the same water state.
 * Awtsmoos.com receives typed render artifacts without polluting bulk-liquid
 * authority or inventing unstable particle identities.
 */
import { createLiquidRealismProfile3d } from "./createLiquidRealismProfile3d.js";

const KIND = Object.freeze({ foam: 1, spray: 2, bubble: 3 });

function classification(particle, profile) {
	const attributes = particle.attributes ?? {};
	const neighbors = Number(attributes.liquidNeighbors ?? 0);
	const density = Number(attributes.liquidDensity ?? 1);
	const vorticity = Number(attributes.liquidVorticity ?? 0);
	const speed = Math.hypot(...particle.velocity);
	if (neighbors <= Math.max(2, profile.restNeighbors * 0.25) && speed >= profile.spraySpeed) return [KIND.spray, Math.min(1, speed / Math.max(profile.spraySpeed, 1e-6))];
	if (vorticity >= profile.foamVorticity && neighbors < profile.restNeighbors) return [KIND.foam, Math.min(1, vorticity / Math.max(profile.foamVorticity * 2, 1e-6))];
	if (density >= profile.bubbleDensity && particle.velocity[1] < 0.25) return [KIND.bubble, Math.min(1, density / Math.max(profile.bubbleDensity * 2, 1e-6))];
	return [0, 0];
}

/** Creates compact secondary-liquid typed buffers. */
export function createLiquidSecondaryArtifact3d(state, options = {}) {
	const profile = createLiquidRealismProfile3d(options.realism ?? options.profile ?? options);
	const selected = state.particleSystem.particles.map(particle => ({ particle, result: classification(particle, profile) }))
		.filter(entry => entry.result[0] !== 0);
	return Object.freeze({
		schema: "awtsmoos.liquid-secondary-artifact-3d",
		sourceSystemId: state.particleSystem.id,
		ids: Object.freeze(selected.map(entry => entry.particle.id)),
		positions: new Float32Array(selected.flatMap(entry => entry.particle.position)),
		velocities: new Float32Array(selected.flatMap(entry => entry.particle.velocity)),
		kinds: new Uint8Array(selected.map(entry => entry.result[0])),
		intensity: new Float32Array(selected.map(entry => entry.result[1])),
		counts: Object.freeze({
			foam: selected.filter(entry => entry.result[0] === KIND.foam).length,
			spray: selected.filter(entry => entry.result[0] === KIND.spray).length,
			bubble: selected.filter(entry => entry.result[0] === KIND.bubble).length
		})
	});
}
