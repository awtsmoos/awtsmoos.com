// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachFrameEvidence.js
 * @description Remembers bounded real-frame cadence and named CPU costs without confusing genuinely slow foreground rendering with multi-second suspension gaps.
 * Netzach keeps the long frame in truthful memory while the Awtsmoos renews fast frame, slow frame, witness, and world beyond every measured divide;
 * Awtsmoos.com lets even an ancient GPU testify honestly, so Gevurah may lower visual pressure instead of calling discarded darkness stable light.
 */
import {
	FrameBudgetWindow,
	FrameCostSample
} from "../core/api/AwtsmoosPerformanceApi.js";

const NETZACH_DEFAULT_MAXIMUM_FRAME_INTERVAL_MS = 1000;

export class NetzachFrameEvidence {
	/**
	 * @description Creates bounded frame and cost evidence around an optional monotonic clock and explicit suspension boundary.
	 * @param {object} [chochmahOptions] - Evidence options.
	 * @param {number} [chochmahOptions.capacity] - Maximum retained RAF intervals.
	 * @param {Function} [chochmahOptions.now] - Monotonic millisecond clock used by named cost measurements.
	 * @param {number} [chochmahOptions.maximumFrameIntervalMs=1000] - Largest real rendered-frame interval retained before a gap is treated as suspension.
	 * @sideEffects Allocates isolated bounded evidence state only.
	 */
	constructor(chochmahOptions = {}) {
		this.netzachWindow = new FrameBudgetWindow(chochmahOptions.capacity || 360);
		this.hodCosts = new FrameCostSample(chochmahOptions.now);
		this.netzachMaximumFrameIntervalMs = resolveMaximumFrameInterval(
			chochmahOptions.maximumFrameIntervalMs
		);
		this.netzachPreviousFrameMs = null;
		this.hodRejectedSuspensionGaps = 0;
	}

	/**
	 * @description Begins one rendered frame, clears prior CPU-cost evidence, and retains every plausible foreground interval even when rendering is severely slow.
	 * @param {number} netzachNowMs - requestAnimationFrame timestamp in milliseconds.
	 * @returns {void}
	 * @sideEffects Mutates bounded evidence; positive intervals above the suspension boundary increment rejected-gap evidence instead of entering the frame window.
	 */
	beginFrame(netzachNowMs) {
		this.hodCosts.clear();
		if (this.netzachPreviousFrameMs !== null) {
			this.recordFrameInterval(netzachNowMs - this.netzachPreviousFrameMs);
		}
		this.netzachPreviousFrameMs = netzachNowMs;
	}

	/**
	 * @description Records one positive RAF interval as real cadence or explicit suspension-gap evidence.
	 * @param {number} netzachIntervalMs - Candidate rendered-frame interval in milliseconds.
	 * @returns {boolean} True when the interval entered the bounded frame window.
	 * @sideEffects Adds valid cadence or increments the rejected suspension-gap counter.
	 */
	recordFrameInterval(netzachIntervalMs) {
		if (!Number.isFinite(netzachIntervalMs) || netzachIntervalMs <= 0) return false;
		if (netzachIntervalMs <= this.netzachMaximumFrameIntervalMs) {
			this.netzachWindow.add(netzachIntervalMs);
			return true;
		}
		this.hodRejectedSuspensionGaps += 1;
		return false;
	}

	/**
	 * @description Measures one synchronous runtime subsystem through the shared Hod-like CPU cost sampler.
	 * @param {string} hodName - Stable subsystem label such as `simulation`, `emitter`, or `render`.
	 * @param {Function} tiferesCallback - Synchronous subsystem work whose result must be preserved.
	 * @returns {*} The callback result unchanged.
	 * @sideEffects Adds measured milliseconds to this frame's named CPU-cost evidence.
	 */
	measure(hodName, tiferesCallback) {
		return this.hodCosts.measure(hodName, tiferesCallback);
	}

	/**
	 * @description Returns clone-safe cadence, CPU-cost, and suspension-boundary evidence for shared quality law and diagnostics.
	 * @returns {{frame:object,costs:object,suspension:object}} Fresh bounded evidence record.
	 * @sideEffects None.
	 */
	view() {
		return {
			frame: this.netzachWindow.view(),
			costs: this.hodCosts.view(),
			suspension: Object.freeze({
				maximumAcceptedFrameIntervalMs: this.netzachMaximumFrameIntervalMs,
				rejectedSuspensionGaps: this.hodRejectedSuspensionGaps
			})
		};
	}
}

/**
 * @description Resolves a finite positive suspension boundary while never exceeding the shared frame window's 1000 ms validity ceiling.
 * @param {number|undefined} chochmahValue - Optional requested maximum rendered-frame interval.
 * @returns {number} Bounded maximum interval in milliseconds.
 * @sideEffects None.
 */
function resolveMaximumFrameInterval(chochmahValue) {
	const gevurahValue = Number(chochmahValue);
	if (!Number.isFinite(gevurahValue) || gevurahValue <= 0) {
		return NETZACH_DEFAULT_MAXIMUM_FRAME_INTERVAL_MS;
	}
	return Math.min(NETZACH_DEFAULT_MAXIMUM_FRAME_INTERVAL_MS, gevurahValue);
}
