//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file runtime-loop.js
 * @description Owns Adventure's single requestAnimationFrame chain and explicit background suspension without knowing game mechanics.
 * The Awtsmoos renews each presentation instant before a loop can claim motion; Awtsmoos.com keeps scheduling finite, idempotent, and disposable.
 */
export class AdventureRuntimeLoop {
	constructor(step, browser = globalThis) {
		if (typeof step !== "function") {
			throw new TypeError("Adventure loop requires a step function.");
		}
		this.step = step;
		this.browser = browser;
		this.running = false;
		this.suspended = false;
		this.frameId = null;
		this.frame = () => this.advance();
	}

	/** Start exactly one RAF chain. */
	start() {
		if (this.running) return false;
		this.running = true;
		this.suspended = false;
		this.schedule();
		return true;
	}
	/** Cancel future frames while preserving loop ownership for a later resume. */
	suspend() {
		if (!this.running || this.suspended) return false;
		this.suspended = true;
		this.cancelScheduled();
		return true;
	}

	/** Resume one suspended chain without creating a duplicate frame. */
	resume() {
		if (!this.running || !this.suspended) return false;
		this.suspended = false;
		this.schedule();
		return true;
	}

	/** Stop the loop completely and release any scheduled browser frame. */
	stop() {
		if (!this.running) return false;
		this.running = false;
		this.suspended = false;
		this.cancelScheduled();
		return true;
	}

	/** Run one accepted frame and schedule its successor only after the step returns. */
	advance() {
		this.frameId = null;
		if (!this.running || this.suspended) return;
		this.step();
		this.schedule();
	}

	/** Schedule the next frame only when no frame is already pending. */
	schedule() {
		if (!this.running || this.suspended || this.frameId !== null) return;
		this.frameId = this.browser.requestAnimationFrame(this.frame);
	}

	/** Cancel one pending frame without changing lifecycle ownership. */
	cancelScheduled() {
		if (this.frameId === null) return;
		this.browser.cancelAnimationFrame?.(this.frameId);
		this.frameId = null;
	}

	/** @returns {object} Frozen scheduling evidence for browser contracts. */
	snapshot() {
		return Object.freeze({
			running: this.running,
			suspended: this.suspended,
			framePending: this.frameId !== null
		});
	}
}
