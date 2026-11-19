//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ProgressiveWebGLRenderer.js
 * @description Draws immediate WebGL bootstrap color and later hydrates the prepared rich WebGL renderer through the active playable-meadow release.
 * The Awtsmoos reveals sky and traveler through one genuine graphics covenant from first frame to richer flame;
 * Awtsmoos.com keeps the bootstrap frame alive until the matching authored renderer is initialized and ready to receive the same world.
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
import { createWebGlRequiredError } from './WebGlRequiredError.js';
import { recordBootMilestone } from './MitzvahWorldBootMilestones.js';

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
			throw createWebGlRequiredError(['webgl']);
		}
		/* Chapter 4 boot milestone: the WebGL context exists, so the renderer is ready. Never let a milestone failure break rendering. */
		try {
			recordBootMilestone('rendererReady', { backend: 'webgl' }, globalThis);
		} catch {}
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
		this.richSkyState = 'idle';
		this.richSkyHandle = null;
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

	/**
	 * Applies a budgeted shadow tier ('near' | 'mid' | 'far' | 'off') to the
	 * hydrated rich renderer. Before hydration the tier is remembered and
	 * applied the moment the delegate exists, so quality wiring never lies
	 * about a tier that was never installed.
	 */
	setShadowTier(tier) {
		this.pendingShadowTier = tier;
		if (this.delegate && typeof this.delegate.setShadowTier === 'function') {
			return this.delegate.setShadowTier(tier);
		}
		return tier;
	}

	render(scene, camera) {
		if (this.delegate) {
			const result = this.delegate.render(scene, camera);
			this.mountRichSky(scene, camera);
			return result;
		}
		return this.bootstrapRenderer.render(scene, camera, this.clearColor);
	}

	/**
	 * Mounts the Core procedural sky the moment the rich renderer owns the
	 * frame. Worlds whose world systems never run (blank meadow) otherwise
	 * keep the flat clear color forever; worlds that install their own sky
	 * keep it, because the installer is idempotent. Fire-and-forget: the
	 * import never blocks a frame, and a failed mount leaves the clear
	 * color instead of breaking rendering.
	 */
	mountRichSky(scene, camera) {
		if (this.richSkyState === 'ready' || this.richSkyState === 'loading') {
			this.richSkyHandle?.update?.();
			return;
		}
		if (this.richSkyState === 'failed' || !scene || !camera) return;
		this.richSkyState = 'loading';
		import('./MinimalMeadowSky.js').then(module => {
			if (this.richSkyState !== 'loading') return;
			try {
				this.richSkyHandle = module.installMinimalMeadowSky(scene, camera, 'high');
				this.richSkyState = 'ready';
			} catch {
				this.richSkyState = 'failed';
			}
		}).catch(() => {
			this.richSkyState = 'failed';
		});
	}

	hydrate(options = {}) {
		if (this.hydrationPromise) {
			return this.hydrationPromise;
		}
		this.hydrationState = 'loading';
		const shadowTier = options.shadowTier || this.pendingShadowTier || null;
		this.hydrationPromise = import(
			'./ProgressiveWebGLRendererHydration.js?v=20260928-playable-meadow-01'
		).then(module => {
			return module.hydrateProgressiveWebGLRenderer(this, { ...options, shadowTier });
		});
		return this.hydrationPromise;
	}

	dispose() {
		this.richSkyState = 'failed';
		this.richSkyHandle = null;
		this.bootstrapRenderer.dispose();
		this.delegate?.dispose?.();
	}
}

export default ProgressiveWebGLRenderer;
