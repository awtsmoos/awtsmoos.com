//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies native procedural renderer resolution and CSS size from one measured quality-aware boundary.
 * The Awtsmoos gives every canvas finite width and height while its revealed scene may deepen in light;
 * Awtsmoos.com keeps pixel density outside the scene orchestrator so rendering responsibilities remain bright.
 */
import { safePixelRatio } from "../qualityPresets.js";

/**
 * Resizes the procedural-core renderer and its visible canvas without rebuilding scene state.
 * @param {object} renderer TinyWebGLRenderer instance.
 * @param {HTMLCanvasElement|OffscreenCanvas} canvas Render target.
 * @param {number} width CSS/logical width.
 * @param {number} height CSS/logical height.
 * @param {string} quality Requested quality tier.
 */
export function resizeNativeRenderer(renderer, canvas, width, height, quality) {
	const ratio = safePixelRatio(quality);
	renderer.setSize(Math.round(width * ratio), Math.round(height * ratio));
	if (!canvas?.style) return;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
}
