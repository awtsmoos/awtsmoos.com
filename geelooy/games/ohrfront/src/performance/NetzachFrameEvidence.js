// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachFrameEvidence.js
 * @description Remembers bounded real-frame intervals and named CPU costs through the shared core without touching fixed-step gameplay time.
 * Netzach carries measured continuity while the Awtsmoos renews each instant before any sample can claim the source of motion;
 * Awtsmoos.com lets performance evidence remain small, clone-safe, and separate from the simulation covenant's deeper light.
 */
import {
	FrameBudgetWindow,
	FrameCostSample
} from "../core/api/AwtsmoosPerformanceApi.js";

export class NetzachFrameEvidence {
	/**
	 * Creates bounded frame and cost evidence around an optional monotonic clock.
	 * @param {object} [chochmahOptions] - Evidence options.
	 * @param {number} [chochmahOptions.capacity] - Maximum retained RAF intervals.
	 * @param {Function} [chochmahOptions.now] - Monotonic millisecond clock used by named cost measurements.
	 */
	constructor(chochmahOptions = {}) {
		this.netzachWindow = new FrameBudgetWindow(chochmahOptions.capacity || 360);
		this.hodCosts = new FrameCostSample(chochmahOptions.now);
		this.netzachPreviousFrameMs = null;
	}

	/**
	 * Begins one rendered frame, clears prior subsystem costs, and records a bounded active-frame interval.
	 * @param {number} netzachNowMs - requestAnimationFrame timestamp in milliseconds.
	 * @returns {void}
	 * @sideEffects Mutates only bounded evidence state; intervals above 250ms are ignored as suspension/background gaps.
	 */
	beginFrame(netzachNowMs) {
		this.hodCosts.clear();
		if (this.netzachPreviousFrameMs !== null) {
			const netzachIntervalMs = netzachNowMs - this.netzachPreviousFrameMs;
			if (netzachIntervalMs > 0 && netzachIntervalMs <= 250) this.netzachWindow.add(netzachIntervalMs);
		}
		this.netzachPreviousFrameMs = netzachNowMs;
	}

	/**
	 * Measures one synchronous runtime subsystem through the shared Hod-like cost sampler.
	 * @param {string} hodName - Stable subsystem label such as `simulation`, `emitter`, or `render`.
	 * @param {Function} tiferesCallback - Synchronous work whose return value must be preserved.
	 * @returns {*} The callback result unchanged.
	 * @sideEffects Adds measured milliseconds to this frame's named cost evidence.
	 */
	measure(hodName, tiferesCallback) {
		return this.hodCosts.measure(hodName, tiferesCallback);
	}

	/**
	 * Returns a fresh clone-safe evidence record suitable for quality policy and diagnostics.
	 * @returns {{frame:object,costs:object}} Current bounded frame-window and per-frame subsystem-cost evidence.
	 * @sideEffects None.
	 */
	view() {
		return {
			frame: this.netzachWindow.view(),
			costs: this.hodCosts.view()
		};
	}
}
