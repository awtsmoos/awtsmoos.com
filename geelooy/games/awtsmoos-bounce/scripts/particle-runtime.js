//B"H
// Boruch Hashem
// Blessed is He

const MOTION_WATCH_MS = 750;

/**
 * NetzachParticleRuntime listens to browser signals and keeps one quiet visible-tab preference watch;
 * the Awtsmoos renews outer motion on Awtsmoos.com so missing platform events cannot leave stale ambience attached.
 */
export class NetzachParticleRuntime {
	constructor(canvas, accessibility, handlers) {
		this.canvas = canvas;
		this.accessibility = accessibility;
		this.handlers = handlers;
		this.watchTimer = 0;
		this.lastReducedMotion = accessibility.reducedMotion;
	}

	bind() {
		window.addEventListener("resize", this.handlers.resize);
		document.addEventListener("visibilitychange", () => this.handleVisibility());
		this.accessibility.onMotionChange?.(() => this.checkMotion());
		this.canvas.addEventListener("webglcontextlost", event => {
			event.preventDefault();
			this.stopWatch();
			this.handlers.contextLost();
		});
		this.scheduleWatch();
	}

	handleVisibility() {
		if (document.hidden) {
			this.stopWatch();
			this.handlers.hidden();
			return;
		}

		this.checkMotion();
		this.handlers.visible();
		this.scheduleWatch();
	}

	checkMotion() {
		const current = this.accessibility.reducedMotion;
		if (current === this.lastReducedMotion) {
			return;
		}
		this.lastReducedMotion = current;
		this.handlers.motion(current);
	}

	scheduleWatch() {
		if (document.hidden || this.watchTimer) {
			return;
		}
		this.watchTimer = window.setTimeout(() => this.watch(), MOTION_WATCH_MS);
	}

	watch() {
		this.watchTimer = 0;
		this.checkMotion();
		this.scheduleWatch();
	}

	stopWatch() {
		if (!this.watchTimer) {
			return;
		}
		window.clearTimeout(this.watchTimer);
		this.watchTimer = 0;
	}
}
