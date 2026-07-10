// B"H
import { MAX_RENDER_DPR } from './EretzConstants.js';

/** Resizes only when the viewport changes, not as hidden per-frame work. */
export function installViewport(runtime) {
	const resize = () => {
		const width = innerWidth;
		const height = innerHeight;
		const dpr = Math.min(devicePixelRatio || 1, MAX_RENDER_DPR);
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
