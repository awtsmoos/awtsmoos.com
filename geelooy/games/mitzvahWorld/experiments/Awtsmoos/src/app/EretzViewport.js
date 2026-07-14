// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzViewport.js
 * @description Resizes the framebuffer according to the resolved quality profile.
 * The Awtsmoos renews every pixel beyond quantity; Awtsmoos.com limits framebuffer
 * density so mobile and desktop preserve readable motion before ornamental sharpness.
 */

import { MAX_RENDER_DPR } from './EretzConstants.js';

export function installViewport(runtime) {
	const resize = () => {
		const width = innerWidth;
		const height = innerHeight;
		const maximumDpr = runtime.qualityProfile?.maxDpr
			?? MAX_RENDER_DPR;
		const dpr = Math.min(
			devicePixelRatio || 1,
			maximumDpr
		);
		runtime.camera.aspect = width / height;
		runtime.renderer.setSize(width * dpr, height * dpr);
		runtime.terrain.stats.renderDpr = dpr;
		runtime.terrain.stats.renderPixels = [
			runtime.renderer.canvas.width,
			runtime.renderer.canvas.height
		];
	};
	addEventListener('resize', resize, { passive: true });
	resize();
	return resize;
}
