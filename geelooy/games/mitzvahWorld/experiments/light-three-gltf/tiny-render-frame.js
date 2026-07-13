// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-frame.js
 * @description Opens one exact frame, advances the truthful frame token, and
 * renders every visible vessel within the continuously renewed world of Awtsmoos.
 */
import { updateCameraMatrices } from './tiny-camera.js';
import { buildRenderList } from './tiny-render-draw-list.js';
import { createFrameStats } from './tiny-render-frame-metrics.js';
import { drawRenderList } from './tiny-render-mesh.js';
import { collectRenderables } from './tiny-render-node.js';
import {
	clearRendererFrame,
	resizeCanvasToDisplaySize
} from './tiny-render-webgl-utils.js';
import { updateWorldMatrices } from './tiny-scene-graph.js';

/** Renders one complete scene and records every measured unit of work. */
export function renderFrame(renderer, scene, camera) {
	renderer.frameToken += 1;
	const resized = resizeCanvasToDisplaySize(renderer.canvas);
	if (resized) {
		renderer.gl.viewport(
			0,
			0,
			renderer.canvas.width,
			renderer.canvas.height
		);
	}
	clearRendererFrame(renderer.gl, renderer.clearColor);
	const aspect = renderer.canvas.width / Math.max(1, renderer.canvas.height);
	const cameraState = updateCameraMatrices(camera, aspect);
	renderer.lastProjection = cameraState.projection;
	renderer.lastView = cameraState.view;
	updateWorldMatrices(scene);
	updateWorldMatrices(camera);
	renderer.stats = createFrameStats(renderer);
	const renderables = [];
	collectRenderables(scene, renderables);
	const renderList = buildRenderList(
		renderables,
		cameraState.cameraWorldPosition
	);
	drawRenderList(renderer, renderList, cameraState);
}
