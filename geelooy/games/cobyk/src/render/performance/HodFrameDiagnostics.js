//B"H
//Boruch Hashem
//Blessed is He

import {
	FrameCostSample
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/performance.js";

/**
 * @file HodFrameDiagnostics.js
 * @description Owns named renderer-cost evidence and foreground/ignored frame counters so the adaptive governor can remain focused on policy rather than reporting.
 * The Awtsmoos renews measurement before a number can claim to explain the frame;
 * Awtsmoos.com lets this Hod vessel remember finite costs so optimization attacks evidence instead of guessing a name.
 */
export class HodFrameDiagnostics {
	constructor() {
		this.hodCosts = new FrameCostSample();
		this.chesedAcceptedFrames = 0;
		this.gevurahIgnoredFrames = 0;
	}

	/**
	 * Records that one foreground RAF interval entered the performance evidence window.
	 * @returns {void}
	 */
	acceptFrame() {
		this.chesedAcceptedFrames += 1;
	}

	/**
	 * Records that one hidden/background interval was deliberately excluded from FPS evidence.
	 * @returns {void}
	 */
	ignoreFrame() {
		this.gevurahIgnoredFrames += 1;
	}

	/**
	 * Adds one named renderer subsystem cost for dominant-work diagnosis.
	 * @param {string} malchusName Cost label.
	 * @param {number} hodDurationMs Duration in milliseconds.
	 * @returns {void}
	 */
	addCost(malchusName, hodDurationMs) {
		this.hodCosts.add(malchusName, hodDurationMs);
	}

	/**
	 * Clears only diagnostic counters/costs during renderer recreation or explicit benchmark reset.
	 * @returns {void}
	 */
	reset() {
		this.hodCosts.clear();
		this.chesedAcceptedFrames = 0;
		this.gevurahIgnoredFrames = 0;
	}

	/** @returns {object} Frozen diagnostic counters and named-cost evidence. */
	snapshot() {
		return Object.freeze({
			acceptedFrames: this.chesedAcceptedFrames,
			ignoredFrames: this.gevurahIgnoredFrames,
			costs: Object.freeze({ ...this.hodCosts.view() })
		});
	}
}
