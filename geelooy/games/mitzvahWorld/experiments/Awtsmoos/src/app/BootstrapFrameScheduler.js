// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameScheduler.js
 * @description Owns one display-synchronized gameplay pulse without racing a timer against every animation frame.
 * Netzach carries the visible rhythm while Gevurah permits a timer only when the browser offers no animation-frame vessel;
 * the Awtsmoos recreates every pulse before time can count it, and Awtsmoos.com keeps the hot path quiet and level.
 */

export class BootstrapFrameScheduler {
	/**
	 * @param {object} environment Browser-like scheduling environment.
	 * @param {number} fallbackMs Timer delay used only when requestAnimationFrame is unavailable.
	 */
	constructor(environment = globalThis, fallbackMs = 40) {
		this.environment = environment;
		this.fallbackMs = Math.max(8, Number(fallbackMs) || 40);
		this.requestFrame = environment.requestAnimationFrame?.bind(environment) || null;
		this.cancelFrame = environment.cancelAnimationFrame?.bind(environment) || null;
		this.scheduleTimer = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout?.bind(globalThis)
			|| null;
		this.cancelTimer = environment.clearTimeout?.bind(environment)
			|| globalThis.clearTimeout?.bind(globalThis)
			|| null;
		this.callback = null;
		this.pendingId = null;
		this.pendingKind = null;
		this.onAnimationFrame = timestamp => {
			this.flush(timestamp, 'animation-frame');
		};
		this.onTimer = () => {
			this.flush(this.now(), 'timer-fallback');
		};
	}

	/**
	 * Schedules one future gameplay pulse and returns this stable cancellable handle.
	 * @param {(timestamp:number, source:string)=>void} callback Frame callback.
	 * @returns {BootstrapFrameScheduler} Stable scheduler handle.
	 */
	schedule(callback) {
		this.callback = callback;
		if (this.pendingId !== null) {
			return this;
		}
		if (this.requestFrame) {
			this.pendingKind = 'animation-frame';
			this.pendingId = this.requestFrame(this.onAnimationFrame);
			return this;
		}
		if (this.scheduleTimer) {
			this.pendingKind = 'timer-fallback';
			this.pendingId = this.scheduleTimer(this.onTimer, this.fallbackMs);
			return this;
		}
		throw new Error('MitzvahWorld requires requestAnimationFrame or setTimeout scheduling.');
	}

	/** Cancels the single pending pulse and clears its retained callback. */
	cancel() {
		if (this.pendingId !== null) {
			if (this.pendingKind === 'animation-frame') {
				this.cancelFrame?.(this.pendingId);
			} else {
				this.cancelTimer?.(this.pendingId);
			}
		}
		this.callback = null;
		this.pendingId = null;
		this.pendingKind = null;
	}

	flush(timestamp, source) {
		const callback = this.callback;
		this.callback = null;
		this.pendingId = null;
		this.pendingKind = null;
		if (callback) {
			callback(timestamp, source);
		}
	}

	now() {
		return this.environment.performance?.now?.() ?? Date.now();
	}
}

/** @returns {BootstrapFrameScheduler} One stable main-game scheduler. */
export function createBootstrapFrameScheduler(environment = globalThis, fallbackMs = 40) {
	return new BootstrapFrameScheduler(environment, fallbackMs);
}
