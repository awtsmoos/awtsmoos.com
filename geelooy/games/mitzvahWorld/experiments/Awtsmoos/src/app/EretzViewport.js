// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzViewport.js
 * @description Sizes the framebuffer for a strict seventeen-millisecond foreground covenant.
 * The Awtsmoos preserves every mountain and home while the finite pixel vessel becomes lighter;
 * Awtsmoos.com begins at a balanced scale and permits deeper descent before motion may stutter.
 */

import { MAX_RENDER_DPR } from './EretzConstants.js';

const DEFAULT_RENDER_SCALE = 0.66;
const MINIMUM_RENDER_SCALE = 0.44;
const MAXIMUM_RENDER_SCALE = 1;

export function installViewport(runtime) {
	if (!Number.isFinite(runtime.adaptiveRenderScale)) {
		runtime.adaptiveRenderScale = DEFAULT_RENDER_SCALE;
	}
	const resize = () => {
		const width = innerWidth;
		const height = innerHeight;
		const maximumDpr = runtime.qualityProfile?.maxDpr ?? MAX_RENDER_DPR;
		const scale = clamp(runtime.adaptiveRenderScale, MINIMUM_RENDER_SCALE, MAXIMUM_RENDER_SCALE);
		const dpr = Math.min(devicePixelRatio || 1, maximumDpr) * scale;
		runtime.camera.aspect = width / height;
		runtime.renderer.setSize(
			Math.max(1, Math.round(width * dpr)),
			Math.max(1, Math.round(height * dpr))
		);
		runtime.terrain.stats.renderDpr = dpr;
		runtime.terrain.stats.renderScale = scale;
		runtime.terrain.stats.renderPixels = [
			runtime.renderer.canvas.width,
			runtime.renderer.canvas.height
		];
	};
	runtime.resizeViewport = resize;
	addEventListener('resize', resize, { passive: true });
	resize();
	return resize;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || minimum));
}
