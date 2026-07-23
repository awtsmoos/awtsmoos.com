// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLRenderer.js
 * @description Creates real WebGL immediately and defers the rich shader renderer.
 * The Awtsmoos reveals a clear living framebuffer before every luminous garment;
 * Awtsmoos.com preserves the runtime contract while rich rendering enters after playability.
 */

import {
	createProgressiveEnvironment,
	createProgressiveStats
} from './ProgressiveWebGLDefaults.js';

export class ProgressiveWebGLRenderer {
	constructor({ alpha = true, antialias = false, canvas } = {}) {
		if (!canvas) throw new Error('ProgressiveWebGLRenderer requires a canvas.');
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', {
			alpha,
			antialias,
			premultipliedAlpha: true
		});
		if (!this.gl) throw new Error('WebGL is not available.');
		this.backend = 'webgl';
		this.contextName = 'webgl';
		this.clearColor = [0.36, 0.56, 0.72, 1];
		this.environment = createProgressiveEnvironment();
		this.interactor = { x: 0, y: 0, z: 0 };
		this.timeSeconds = 0;
		this.options = {
			culling: true,
			defaultRenderDistance: 560,
			staticBatcher: null
		};
		this.delegate = null;
		this.hydrationPromise = null;
		this.hydrationState = 'idle';
		this.hydrationError = null;
		this.errors = [];
		this.bootstrapStats = createProgressiveStats();
	}

	get stats() {
		return this.delegate?.stats || this.bootstrapStats;
	}

	get info() {
		return this.delegate?.info || { render: this.stats };
	}

	get triangles() {
		return this.stats.triangles || 0;
	}

	setSize(width, height) {
		const pixelWidth = Math.max(1, Math.floor(width));
		const pixelHeight = Math.max(1, Math.floor(height));
		if (this.delegate) return this.delegate.setSize(pixelWidth, pixelHeight);
		this.canvas.width = pixelWidth;
		this.canvas.height = pixelHeight;
		this.gl.viewport(0, 0, pixelWidth, pixelHeight);
	}

	setClearColor(red, green, blue, alpha = 1) {
		this.clearColor = [red, green, blue, alpha];
		this.delegate?.setClearColor(red, green, blue, alpha);
	}

	setEnvironment(values = {}) {
		for (const [key, value] of Object.entries(values)) {
			this.environment[key] = Array.isArray(value) ? [...value] : value;
		}
		this.delegate?.setEnvironment(values);
	}

	setInteractor(position, timeSeconds = performance.now() / 1000) {
		this.interactor = {
			x: position?.x || 0,
			y: position?.renderY ?? position?.y ?? 0,
			z: position?.z || 0
		};
		this.timeSeconds = timeSeconds;
		this.delegate?.setInteractor(position, timeSeconds);
	}

	render(scene, camera) {
		if (this.delegate) return this.delegate.render(scene, camera);
		const color = this.clearColor;
		this.gl.clearColor(color[0], color[1], color[2], color[3]);
		this.gl.clearDepth?.(1);
		this.gl.enable?.(this.gl.DEPTH_TEST);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.bootstrapStats.frames += 1;
	}

	hydrate(options = {}) {
		if (this.hydrationPromise) return this.hydrationPromise;
		this.hydrationState = 'loading';
		this.hydrationPromise = import(
			'./ProgressiveWebGLRendererHydration.js?v=20260722-renderer-02'
		).then(module => module.hydrateProgressiveWebGLRenderer(this, options));
		return this.hydrationPromise;
	}

	dispose() {
		this.delegate?.dispose?.();
	}
}

export default ProgressiveWebGLRenderer;
