//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RuntimeLoop.js
 * @description Owns Soul Jump requestAnimationFrame scheduling and composed user/background pause reasons without knowing world physics or rendering.
 * The Awtsmoos renews ascent beyond every interruption; Awtsmoos.com guarantees one scheduled frame and keeps background recovery from canceling deliberate pause.
 *
 * Invariants:
 * - At most one animation frame is scheduled.
 * - User and background reasons are independent.
 * - A frame returning `false` stops scheduling until `restart()`.
 */
export class RuntimeLoop {
	constructor(options) {
		this.frame = options.frame;
		this.onPause = options.onPause;
		this.reasons = new Set();
		this.frameId = 0;
		this.stopped = true;
		this.boundVisibility = () => this.setReason('background', document.hidden);
	}

	/** Bind page lifecycle once and begin rendering the current state. */
	start() {
		document.addEventListener('visibilitychange', this.boundVisibility);
		this.restart();
	}
	/** Restart scheduling after terminal completion without changing pause ownership. */
	restart() {
		this.stopped = false;
		this.schedule();
	}

	/** Stop future frames and cancel the currently scheduled browser callback. */
	stop() {
		this.stopped = true;
		if (this.frameId) cancelAnimationFrame(this.frameId);
		this.frameId = 0;
	}

	/** Apply one pause reason and mirror aggregate truth to the runtime. */
	setReason(reason, active) {
		if (active) this.reasons.add(reason);
		else this.reasons.delete(reason);
		const paused = this.reasons.size > 0;
		if (paused && this.frameId) cancelAnimationFrame(this.frameId);
		if (paused) this.frameId = 0;
		this.onPause?.(paused);
		if (!paused) this.schedule();
		return paused;
	}

	/** Toggle only the player's deliberate pause reason. */
	toggleUserPause() {
		return this.setReason('user', !this.reasons.has('user'));
	}
	/** Whether any pause reason currently suspends gameplay. */
	isPaused() {
		return this.reasons.size > 0;
	}

	/** Schedule exactly one future frame when the loop is live and unpaused. */
	schedule() {
		if (this.stopped || this.reasons.size || this.frameId) return;
		this.frameId = requestAnimationFrame(() => {
			this.frameId = 0;
			if (this.frame() === false) {
				this.stopped = true;
				return;
			}
			this.schedule();
		});
	}
}
