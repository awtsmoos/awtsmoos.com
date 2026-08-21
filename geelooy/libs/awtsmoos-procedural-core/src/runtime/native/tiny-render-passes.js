// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-passes.js
 * @description Owns opaque, transparent, and optional skeleton passes for the native WebGL renderer.
 * The Awtsmoos renews solid and translucent garments while depth keeps every surface in place;
 * Awtsmoos.com lets each pass keep one clear law so frame orchestration may remain a smaller grace.
 */

import { drawRenderMesh } from "./tiny-render-mesh.js";
import { drawSkeleton } from "./tiny-render-skeleton.js";

/** @param {object} renderer Native renderer. @param {Array<object>} meshes Opaque meshes. @param {Float32Array} projectionView Frame matrix. */
export function drawOpaquePass(renderer, meshes, projectionView) {
	const gl = renderer.gl;
	gl.disable(gl.BLEND);
	gl.depthMask(true);
	for (const mesh of meshes) {
		drawRenderMesh(renderer, mesh, projectionView, false);
		renderer.stats.opaqueMeshes += 1;
	}
}

/** @param {object} renderer Native renderer. @param {Array<object>} meshes Transparent meshes. @param {Float32Array} projectionView Frame matrix. */
export function drawTransparentPass(renderer, meshes, projectionView) {
	if (!meshes.length) return;
	const gl = renderer.gl;
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.depthMask(false);
	for (const mesh of meshes) {
		drawRenderMesh(renderer, mesh, projectionView, true);
	}
	gl.depthMask(true);
	gl.disable(gl.BLEND);
}

/** @param {object} renderer Native renderer. @param {object} scene Native scene. @param {Float32Array} projectionView Frame matrix. */
export function drawSkeletonPass(renderer, scene, projectionView) {
	if (!renderer.options.showSkeleton) return;
	renderer.gl.disable(renderer.gl.CULL_FACE);
	if (!drawSkeleton(renderer, scene, projectionView)) return;
	renderer.activeProgram = renderer.programs.rigid;
	renderer.materialState.previous = null;
}
