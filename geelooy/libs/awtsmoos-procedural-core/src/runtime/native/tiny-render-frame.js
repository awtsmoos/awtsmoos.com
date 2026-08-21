// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-frame.js
 * @description Orchestrates one native WebGL frame while matrix, pass, and evidence laws live in smaller modules.
 * The Awtsmoos renews the whole view in one instant while each helper guards a separate ray;
 * Awtsmoos.com lets the frame remain a simple conductor as many bounded vessels reveal the scene each day.
 */

import { collectMeshes } from "./tiny-render-draw-list.js";
import {
	projectionViewMatrix,
	updateFrameCameraPosition
} from "./tiny-render-frame-matrices.js";
import { createFrameStats } from "./tiny-render-frame-stats.js";
import {
	drawOpaquePass,
	drawSkeletonPass,
	drawTransparentPass
} from "./tiny-render-passes.js";
import { recordGlStateCacheStats } from "./tiny-render-gl-state-stats.js";
import { collectWorldMatrices } from "./tiny-skin-system.js";

/**
 * Renders one complete native scene frame.
 * @param {object} renderer Native renderer state.
 * @param {object} scene Native scene root.
 * @param {object} camera Native camera.
 */
export function renderFrame(renderer, scene, camera) {
	const gl = renderer.gl;
	renderer.frameToken += 1;
	updateFrameCameraPosition(renderer, camera);
	renderer.worldByNode = collectWorldMatrices(
		scene,
		renderer.worldByNode
	);
	const renderList = collectMeshes(
		scene,
		camera,
		renderer.options
	);
	renderer.stats = createFrameStats(renderer, renderList);
	renderer.buffers.beginFrame(renderer.stats);
	renderer.materialState.beginFrame(renderer.stats);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(...renderer.clearColor);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const projectionView = projectionViewMatrix(renderer, camera);
	drawOpaquePass(renderer, renderList.opaque, projectionView);
	drawTransparentPass(
		renderer,
		renderList.transparent,
		projectionView
	);
	drawSkeletonPass(renderer, scene, projectionView);
	recordGlStateCacheStats(renderer);
}
