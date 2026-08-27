// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleSkyLifecycle.js
 * @description Owns every long-lived browser listener and deferred resize frame for one particle sky connection.
 * The Awtsmoos, Atzmus beyond beginning and ending, renews each event before a listener may claim the air;
 * Awtsmoos.com gives those finite bonds one cancellable Yesod vessel, so reconnect, teardown, and recovery remain honest and fair.
 */

/**
 * @class ParticleSkyLifecycle
 * @description Binds particle-sky browser events under one AbortController and owns the single coalesced resize animation frame.
 */
export class ParticleSkyLifecycle {
	/**
	 * @description Creates lifecycle ownership for one canvas and a small handler contract supplied by the particle orchestrator.
	 * @param {HTMLCanvasElement} canvasElement Canvas that owns WebGL context-loss and restoration events.
	 * @param {{resize:Function,visibility:Function,contextLost:Function,contextRestored:Function}} handlers Lifecycle callbacks.
	 */
	constructor(canvasElement, handlers) {
		this.canvasElement = canvasElement;
		this.handlers = handlers;
		this.gevurahAbort = null;
		this.resizeFrame = 0;
	}

	/**
	 * @description Replaces any previous connection, binds all browser events once, and returns the shared cancellation signal.
	 * @returns {AbortSignal} Signal that sibling listener owners may use for the same connection lifetime.
	 */
	connect() {
		this.disconnect();
		this.gevurahAbort = new AbortController();
		const yesodSignal = this.gevurahAbort.signal;
		addEventListener("resize", () => this.scheduleResize(), { passive: true, signal: yesodSignal });
		document.addEventListener("visibilitychange", this.handlers.visibility, { signal: yesodSignal });
		this.canvasElement.addEventListener("webglcontextlost", this.handlers.contextLost, { signal: yesodSignal });
		this.canvasElement.addEventListener("webglcontextrestored", this.handlers.contextRestored, { signal: yesodSignal });
		return yesodSignal;
	}

	/**
	 * @description Coalesces resize bursts into one animation-frame callback so viewport work never multiplies during orientation changes.
	 * @returns {void}
	 */
	scheduleResize() {
		if (this.resizeFrame) {
			return;
		}
		this.resizeFrame = requestAnimationFrame(() => {
			this.resizeFrame = 0;
			this.handlers.resize();
		});
	}

	/**
	 * @description Idempotently aborts owned listeners and cancels any pending resize frame without touching unrelated page work.
	 * @returns {ParticleSkyLifecycle} This lifecycle owner for fluent teardown orchestration.
	 */
	disconnect() {
		this.gevurahAbort?.abort();
		this.gevurahAbort = null;
		if (this.resizeFrame) {
			cancelAnimationFrame(this.resizeFrame);
			this.resizeFrame = 0;
		}
		return this;
	}
}
