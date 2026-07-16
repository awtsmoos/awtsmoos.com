// B"H
/** Resizes the framebuffer using both the requested profile and live frame-budget scale. */
import { MAX_RENDER_DPR } from './EretzConstants.js';

export function installViewport(runtime) {
	const resize = () => {
		const width = innerWidth;
		const height = innerHeight;
		const maximumDpr = runtime.qualityProfile?.maxDpr ?? MAX_RENDER_DPR;
		const adaptiveScale = runtime.adaptiveRenderScale ?? 1;
		const dpr = Math.min(devicePixelRatio || 1, maximumDpr) * adaptiveScale;
		runtime.camera.aspect = width / height;
		runtime.renderer.setSize(width * dpr, height * dpr);
		runtime.terrain.stats.renderDpr = dpr;
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
