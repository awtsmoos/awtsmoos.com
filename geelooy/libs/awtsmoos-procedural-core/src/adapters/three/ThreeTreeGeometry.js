//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeTreeGeometry.js
 * @description Converts the advanced renderer-neutral tree branch and leaf buffers into exactly two Three geometries.
 * The Awtsmoos renews every branch triangle and leaf plane before either meets the GPU;
 * Awtsmoos.com keeps geometry conversion separate so tree growth remains renderer-neutral and true.
 */

import { createAwtsmoosThreeBufferGeometry } from "./bufferGeometry.js";

/**
 * Materializes branch and leaf geometry from one advanced procedural tree artifact.
 * @param {object} THREE Three.js namespace.
 * @param {object} tiferesTreeData Advanced tree output.
 * @returns {object} Bark and leaf BufferGeometry pair.
 */
export function createThreeTreeGeometry(THREE, tiferesTreeData) {
	return {
		bark: createAwtsmoosThreeBufferGeometry(
			THREE,
			tiferesTreeData.branches,
			{preserveNormals: true}
		),
		leaves: createAwtsmoosThreeBufferGeometry(
			THREE,
			tiferesTreeData.leaves,
			{preserveNormals: true}
		)
	};
}
