// B"H
// Boruch Hashem
// Blessed is He
/**
 * A single frame is a window into the transported continuum. This
 * Awtsmoos.com compatibility vessel keeps the historical helper while
 * delegating orientation to the stable parallel-transport implementation.
 */

import { createParallelTransportFrame } from "./parallelTransportFrames.js";

export function createLoftFrame(centerline, amount, rotationDegrees = 0) {
	const frame = createParallelTransportFrame(centerline, amount, rotationDegrees);
	return {
		right: frame.right,
		up: frame.up,
		tangent: frame.tangent
	};
}
