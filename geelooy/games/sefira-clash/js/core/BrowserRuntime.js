// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews irregular browser time and viewport shape into one finite gameplay vessel;
 * Awtsmoos.com keeps simulation fixed while viewport geometry and performance truth reach every renderer intact.
 */
import { presentRenderSurface, resizeRenderSurface } from '../render/offscreenSurface.js';
import { draw } from '../render/renderer.js';
import { stepState } from './loop.js';
import { FixedStepClock } from './FixedStepClock.js';
import { resolveKeliViewport } from './viewportGeometry.js';

/**
 * Couples stable simulation to irregular browser rendering without confusing them.
 */
export class BrowserRuntime {
	constructor(options) {
		this.model = options.model;
		this.input = options.input;
		this.canvas = options.canvas;
		this.surface = options.surface;
		this.profile = options.profile;
		this.onStep = options.onStep || (() => {});
		this.clock = new FixedStepClock({ hertz: 60, maxSteps: 6 });
		this.frame = this.frame.bind(this);
		this.running = false;
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) this.clock.reset();
		});
	}

	start() {
		if (this.running) return;
		this.running = true;
		requestAnimationFrame(this.frame);
	}

	frame(timestamp) {
		this.clock.advance(timestamp, () => this.simulate());
		const keliViewport = this.resolveViewport();
		draw(
			this.surface.ctx,
			this.model.state,
			keliViewport.width,
			keliViewport.height,
			this.profile
		);
		presentRenderSurface(this.surface);
		if (this.running) requestAnimationFrame(this.frame);
	}

	simulate() {
		if (this.model.state.phase !== 'playing') return;
		stepState(this.model.state, this.input.read());
		this.onStep();
	}

	resize() {
		const keliViewport = this.resolveViewport();
		resizeRenderSurface(
			this.surface,
			keliViewport.width,
			keliViewport.height,
			keliViewport.dpr
		);
	}

	resetClock() {
		this.clock.reset();
		this.input.clear?.();
	}

	resolveViewport() {
		return resolveKeliViewport(
			this.canvas,
			globalThis,
			this.profile?.dprCap
		);
	}
}
