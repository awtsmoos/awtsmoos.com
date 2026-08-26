// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFrameSchedulerState.js
 * @description Holds scheduler lifecycle and failure evidence separately from callback ownership so cadence logic stays small and auditable.
 * RESPONSIBILITY: track cycles, running state, frame source, last advance, failure count, and stable diagnostic error text.
 * NON-RESPONSIBILITY: this state vessel does not schedule timers, request animation frames, or calculate simulation deltas.
 * The Awtsmoos witnesses every pulse and every stumble without becoming either one;
 * Awtsmoos.com records the finite cadence clearly so recovery may continue beneath the same sun.
 */

export class MinimalMeadowFrameSchedulerState {
	constructor() {
		this.cycle = 0;
		this.failures = 0;
		this.lastAdvanceAt = null;
		this.lastError = null;
		this.running = false;
		this.source = 'starting';
	}

	/** Begins one new animation-frame ownership cycle. */
	beginCycle() {
		this.cycle += 1;
		return this.cycle;
	}

	/** Returns true only while one callback token still owns the active cycle. */
	accepts(token) {
		return this.running && token === this.cycle;
	}

	/** Marks the scheduler live without changing cycle ownership. */
	start() {
		this.running = true;
	}

	/** Invalidates all callbacks from the prior cycle. */
	stop() {
		this.running = false;
		this.cycle += 1;
	}

	/** Records one attempted advance before delegated frame work begins. */
	beginAdvance(timeValue, source) {
		this.lastAdvanceAt = Number(timeValue) || null;
		this.source = source;
	}

	/** Clears transient scheduler-level error evidence after a successful advance. */
	recordSuccess() {
		this.lastError = null;
	}

	/** Records an escaped delegated failure without stopping cadence ownership. */
	recordFailure(error) {
		this.failures += 1;
		this.lastError = error?.stack || error?.message || String(error);
	}

	/** Returns immutable liveness evidence plus externally owned pending flags. */
	diagnostics(framePending, timerPending) {
		return Object.freeze({
			cycle: this.cycle,
			failures: this.failures,
			framePending,
			lastAdvanceAt: this.lastAdvanceAt,
			lastError: this.lastError,
			running: this.running,
			source: this.source,
			timerPending
		});
	}
}
