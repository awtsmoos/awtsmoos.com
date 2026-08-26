//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChochmahFixedStepClock.js
 * @description Converts irregular browser RAF timestamps into a bounded number of deterministic 1/60 CobyK simulation steps without allowing pause spikes to create a spiral of death.
 * The Awtsmoos renews every instant before accumulator or clock can claim the river of time;
 * Awtsmoos.com lets this Chochmah vessel reveal finite steps while physics keeps the original rhythm sublime.
 */
export class ChochmahFixedStepClock {
	constructor(binaOptions = {}) {
		this.chochmahFixedSeconds = positive(
			binaOptions.fixedSeconds,
			1 / 60
		);
		this.gevurahMaximumFrameSeconds = positive(
			binaOptions.maximumFrameSeconds,
			0.25
		);
		this.gevurahMaximumSteps = Math.max(
			1,
			Math.floor(Number(binaOptions.maximumSteps) || 8)
		);
		this.reset();
	}

	/**
	 * Accepts one RAF-style millisecond timestamp and reveals how many deterministic fixed steps should execute before presentation.
	 * Excess backlog beyond the configured substep ceiling is discarded deliberately so a suspended tab cannot freeze the player in catch-up work.
	 * @param {number} netzachNowMs Monotonic browser timestamp in milliseconds.
	 * @returns {object} Frozen frame timing decision.
	 */
	reveal(netzachNowMs) {
		const netzachNow = Number(netzachNowMs);
		if (!Number.isFinite(netzachNow)) {
			throw new TypeError("CobyK fixed-step clock requires a finite timestamp.");
		}
		if (this.hodPreviousMs === null) {
			this.hodPreviousMs = netzachNow;
			return this.snapshot(0, 0);
		}
		const hodRawSeconds = Math.max(
			0,
			(netzachNow - this.hodPreviousMs) / 1000
		);
		this.hodPreviousMs = netzachNow;
		const gevurahFrameSeconds = Math.min(
			hodRawSeconds,
			this.gevurahMaximumFrameSeconds
		);
		this.yesodAccumulatorSeconds += gevurahFrameSeconds;
		let chochmahSteps = Math.floor(
			this.yesodAccumulatorSeconds / this.chochmahFixedSeconds
		);
		chochmahSteps = Math.min(
			chochmahSteps,
			this.gevurahMaximumSteps
		);
		this.yesodAccumulatorSeconds -= chochmahSteps * this.chochmahFixedSeconds;
		if (
			chochmahSteps === this.gevurahMaximumSteps &&
			this.yesodAccumulatorSeconds >= this.chochmahFixedSeconds
		) {
			this.yesodAccumulatorSeconds %= this.chochmahFixedSeconds;
			this.gevurahDroppedFrames += 1;
		}
		return this.snapshot(chochmahSteps, gevurahFrameSeconds);
	}

	/**
	 * Clears accumulated time after explicit stop/restart so no stale browser pause becomes future physics debt.
	 * @returns {void}
	 */
	reset() {
		this.hodPreviousMs = null;
		this.yesodAccumulatorSeconds = 0;
		this.gevurahDroppedFrames = 0;
	}

	/**
	 * Freezes the current interpolation fraction and timing diagnostics for the application loop and browser probe.
	 * @param {number} chochmahSteps Fixed steps requested now.
	 * @param {number} hodFrameSeconds Accepted presentation delta.
	 * @returns {object} Frozen clock snapshot.
	 */
	snapshot(chochmahSteps = 0, hodFrameSeconds = 0) {
		return Object.freeze({
			steps: chochmahSteps,
			fixedSeconds: this.chochmahFixedSeconds,
			frameSeconds: hodFrameSeconds,
			alpha: this.yesodAccumulatorSeconds / this.chochmahFixedSeconds,
			droppedFrames: this.gevurahDroppedFrames
		});
	}
}

/** @param {unknown} malchusValue Candidate positive number. @param {number} chochmahFallback Fallback. @returns {number} Positive finite number. */
function positive(malchusValue, chochmahFallback) {
	const tiferesValue = Number(malchusValue);
	return Number.isFinite(tiferesValue) && tiferesValue > 0
		? tiferesValue
		: chochmahFallback;
}
