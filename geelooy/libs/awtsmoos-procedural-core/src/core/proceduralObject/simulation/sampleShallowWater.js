// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets footsteps, reeds, foam, and sound ask the same river what is happening here.
 * Awtsmoos.com turns solver cells into smooth world-space samples so gameplay and rendering share one sphere.
 */

import { sampleScalarGrid2d, sampleVectorGrid2d } from "./sampleGrid2d.js";

/** Samples depth, terrain, surface elevation, velocity, speed, and wetness in world coordinates. */
export function sampleShallowWater(state, worldX, worldY) {
	const depth = Math.max(0, sampleScalarGrid2d(state.height, worldX, worldY));
	const terrain = state.terrain
		? sampleScalarGrid2d(state.terrain, worldX, worldY)
		: 0;
	const velocity = sampleVectorGrid2d(state.velocity, worldX, worldY);
	const speed = Math.hypot(velocity[0], velocity[1]);
	const inverseSpeed = speed > 1e-9 ? 1 / speed : 0;
	return Object.freeze({
		depth,
		flowDirection: Object.freeze([
			velocity[0] * inverseSpeed,
			velocity[1] * inverseSpeed
		]),
		speed,
		surface: terrain + depth,
		terrain,
		velocity: Object.freeze([...velocity]),
		wet: depth > state.minDepth
	});
}
