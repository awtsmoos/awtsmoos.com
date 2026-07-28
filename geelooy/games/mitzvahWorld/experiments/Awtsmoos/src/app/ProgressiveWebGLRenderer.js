// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLRenderer.js
 * @description Draws immediate bootstrap color and later hydrates the rich WebGL renderer.
 * The Awtsmoos reveals sky and traveler before every garment has entered the frame;
 * Awtsmoos.com keeps one renderer contract while state flows through each luminous name.
 */
import { BootstrapColorRenderer } from './BootstrapColorRenderer.js?v=20260723-meadow-07';
import {
	createProgressiveEnvironment,
	createProgressiveStats
} from './ProgressiveWebGLDefaults.js';
import {
	setProgressiveRendererEnvironment,
	setProgressiveRendererInteractor,
	setProgressiveRendererSize
} from './ProgressiveWebGLState.js';
import { createWebGlUnavailableError } from './RendererFallbackEvidence.js';
export class ProgressiveWebGLRenderer {
	constructor({ alpha = true, antialias = false, canvas } = {}) {
		if (!canvas) {
			throw new Error('ProgressiveWebGLRenderer requires a canvas.');
		}

		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', {
			alpha,
			antialias,
			premultipliedAlpha: true
		});

		if (!this.gl) {
			throw createWebGlUnavailableError(['webgl']);
		}

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
		this.bootstrapRenderer = new BootstrapColorRenderer(
			this.gl,
			this.bootstrapStats
		);
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
		setProgressiveRendererSize(this, width, height);
	}

	setClearColor(red, green, blue, alpha = 1) {
		this.clearColor = [red, green, blue, alpha];
		this.delegate?.setClearColor(red, green, blue, alpha);
	}

	setEnvironment(values = {}) {
		setProgressiveRendererEnvironment(this, values);
	}

	setInteractor(position, timeSeconds = performance.now() / 1000) {
		setProgressiveRendererInteractor(this, position, timeSeconds);
	}

	render(scene, camera) {
		if (this.delegate) {
			return this.delegate.render(scene, camera);
		}

		return this.bootstrapRenderer.render(scene, camera, this.clearColor);
	}

	hydrate(options = {}) {
		if (this.hydrationPromise) {
			return this.hydrationPromise;
		}

		this.hydrationState = 'loading';
		this.hydrationPromise = import(
			'./ProgressiveWebGLRendererHydration.js?v=20260722-renderer-02'
		).then((module) => {
			return module.hydrateProgressiveWebGLRenderer(this, options);
		});
		return this.hydrationPromise;
	}

	dispose() {
		this.bootstrapRenderer.dispose();
		this.delegate?.dispose?.();
	}
}

export default ProgressiveWebGLRenderer;