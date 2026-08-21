// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-mesh-draw.js
 * @description Holds native matrix multiplication, draw issuance, and draw accounting for one mesh.
 * The Awtsmoos renews each primitive while a stable draw vessel keeps count of what became seen;
 * Awtsmoos.com lets mesh orchestration stay readable while lower WebGL mechanics remain precise and clean.
 */

import { triangleCountForMode } from "./tiny-render-draw-list.js";
import { drawMode } from "./tiny-render-webgl-utils.js";

/**
 * Multiplies two column-major render matrices into reusable target storage.
 * @param {Float32Array} target Target matrix.
 * @param {Float32Array} left Left matrix.
 * @param {Float32Array} right Right matrix.
 */
export function multiplyRenderMatrices(target, left, right) {
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		for (let row = 0; row < 4; row += 1) {
			target[offset + row] = left[row] * right[offset]
				+ left[row + 4] * right[offset + 1]
				+ left[row + 8] * right[offset + 2]
				+ left[row + 12] * right[offset + 3];
		}
	}
}

/**
 * Issues one native draw call from a prepared mesh-buffer resource.
 * @param {object} renderer Native renderer.
 * @param {object} resource Mesh buffer resource.
 */
export function issueMeshDraw(renderer, resource) {
	const gl = renderer.gl;
	const mode = drawMode(gl, resource.mode);
	if (resource.index) {
		gl.drawElements(
			mode,
			resource.count,
			resource.indexType,
			0
		);
		return;
	}
	gl.drawArrays(mode, 0, resource.count);
}

/**
 * Records draw, triangle, branch, transparency, and grass evidence.
 * @param {object} renderer Native renderer.
 * @param {object} mesh Native mesh.
 * @param {object} resource Mesh buffer resource.
 * @param {boolean} skinned Whether skinning was active.
 * @param {boolean} transparent Whether this was the transparent pass.
 */
export function recordMeshDraw(
	renderer,
	mesh,
	resource,
	skinned,
	transparent
) {
	renderer.stats.draws += 1;
	renderer.stats.triangles += triangleCountForMode(
		resource.mode,
		resource.count
	);
	if (!skinned) {
		renderer.stats.rigidMeshes += 1;
	}
	if (transparent) {
		renderer.stats.transparentMeshes += 1;
	}
	if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
		renderer.stats.reactiveGrassMeshes += 1;
	}
}
