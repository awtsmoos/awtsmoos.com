// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameScheduler.js
 * @description Owns one exact-once gameplay pulse with rAF cadence and a bounded timer liveness watchdog.
 * Netzach prefers the visible browser rhythm while Gevurah keeps one quiet lamp burning when that rhythm is withheld;
 * the Awtsmoos recreates every pulse before either clock can claim independence, and Awtsmoos.com lets only the first messenger enter.
 */

export class BootstrapFrameScheduler {
	/**
	 * @param {object} environment Browser-like scheduling environment.
	 * @param {number} fallbackMs Maximum wait before the timer watchdog advances a suspended rAF frame.
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
		this.watchdogId = null;
		this.onAnimationFrame = timestamp => this.flush(timestamp, 'animation-frame');
		this.onWatchdog = () => this.flush(this.now(), 'timer-watchdog');
		this.onTimerFallback = () => this.flush(this.now(), 'timer-fallback');
	}

	/**
	 * Schedules one future gameplay pulse and returns this stable cancellable handle.
	 * @param {(timestamp:number, source:string)=>void} callback Frame callback.
	 * @returns {BootstrapFrameScheduler} Stable scheduler handle.
	 */
	schedule(callback) {
		this.callback = callback;
		if (this.pendingId !== null || this.watchdogId !== null) return this;
		if (this.requestFrame) {
			this.pendingKind = 'animation-frame';
			this.pendingId = this.requestFrame(this.onAnimationFrame);
			if (this.scheduleTimer) {
				this.watchdogId = this.scheduleTimer(this.onWatchdog, this.fallbackMs);
			}
			return this;
		}
		if (this.scheduleTimer) {
			this.pendingKind = 'timer-fallback';
			this.pendingId = this.scheduleTimer(this.onTimerFallback, this.fallbackMs);
			return this;
		}
		throw new Error('MitzvahWorld requires requestAnimationFrame or setTimeout scheduling.');
	}

	/** Cancels every clock belonging to the single pending pulse. */
	cancel() {
		this.callback = null;
		this.clearClocks();
	}

	flush(timestamp, source) {
		const callback = this.callback;
		this.callback = null;
		this.clearClocks();
		if (callback) callback(timestamp, source);
	}

	clearClocks() {
		const pendingId = this.pendingId;
		const pendingKind = this.pendingKind;
		const watchdogId = this.watchdogId;
		this.pendingId = null;
		this.pendingKind = null;
		this.watchdogId = null;
		if (pendingId !== null) {
			if (pendingKind === 'animation-frame') this.cancelFrame?.(pendingId);
			else this.cancelTimer?.(pendingId);
		}
		if (watchdogId !== null) this.cancelTimer?.(watchdogId);
	}

	now() {
		return this.environment.performance?.now?.() ?? Date.now();
	}
}

/** @returns {BootstrapFrameScheduler} One stable main-game scheduler. */
export function createBootstrapFrameScheduler(environment = globalThis, fallbackMs = 40) {
	return new BootstrapFrameScheduler(environment, fallbackMs);
}
