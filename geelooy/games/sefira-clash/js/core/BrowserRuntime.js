//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the browser runtime vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { presentRenderSurface, resizeRenderSurface } from '../render/offscreenSurface.js';
import { draw } from '../render/renderer.js';
import { stepState } from './loop.js';
import { FixedStepClock } from './FixedStepClock.js';

/**
 * Couples stable simulation to irregular browser rendering without confusing them.
 * The screen may refresh at 60, 90, 120, or 144 Hz; the fighting world receives
 * one consistent law, a measured vessel for the renewing speech of the Awtsmoos.
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
		if (this.running) {
			return;
		}
		this.running = true;
		requestAnimationFrame(this.frame);
	}

	frame(timestamp) {
		this.clock.advance(timestamp, () => this.simulate());
		const width = this.canvas.clientWidth || innerWidth;
		const height = this.canvas.clientHeight || innerHeight;
		draw(this.surface.ctx, this.model.state, width, height);
		presentRenderSurface(this.surface);
		if (this.running) requestAnimationFrame(this.frame);
	}

	simulate() {
		if (this.model.state.phase !== 'playing') {
			return;
		}
		stepState(this.model.state, this.input.read());
		this.onStep();
	}

	resize() {
		resizeRenderSurface(
			this.surface,
			innerWidth,
			innerHeight,
			Math.min(devicePixelRatio || 1, this.profile.dprCap)
		);
	}

	resetClock() {
		this.clock.reset();
		this.input.clear?.();
	}
}
