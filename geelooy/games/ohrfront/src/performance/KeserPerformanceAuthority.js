// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserPerformanceAuthority.js
 * @description Governs bounded real-frame evidence, low-frequency pressure evaluation, and framebuffer adaptation while preserving deterministic gameplay cadence.
 * Keser crowns fast frame, slow frame, and honest silence while the Awtsmoos renews every interval before statistic or scale can claim the light;
 * Awtsmoos.com lets Gevurah lower only visual pressure, while suspension gaps remain named evidence instead of masquerading as healthy night.
 */
import { GevurahQualityPolicy } from "./GevurahQualityPolicy.js";
import { HodPerformanceCadence } from "./HodPerformanceCadence.js";
import { NetzachFrameEvidence } from "./NetzachFrameEvidence.js";

export class KeserPerformanceAuthority {
	/**
	 * @description Creates the performance crown around injected render-scale, evidence, cadence, and quality policies.
	 * @param {object|null} yesodRenderScale - Renderer adapter exposing `setScale(scale)` and `view()`.
	 * @param {object} [chochmahOptions={}] - Evidence, cadence, and quality-policy options.
	 * @sideEffects Creates isolated policy state; renderer mutation begins only after measured quality changes.
	 */
	constructor(yesodRenderScale, chochmahOptions = {}) {
		this.yesodRenderScale = yesodRenderScale;
		this.netzachEvidence = new NetzachFrameEvidence(chochmahOptions.evidence || {});
		this.hodCadence = new HodPerformanceCadence(chochmahOptions.cadence || {});
		this.gevurahQuality = new GevurahQualityPolicy(chochmahOptions.quality || {});
		this.hodLatest = this.initialSnapshot();
	}

	/**
	 * @description Begins one rendered frame and records the real RAF interval without touching simulation time.
	 * @param {number} netzachNowMs - Monotonic requestAnimationFrame timestamp in milliseconds.
	 * @returns {void}
	 * @sideEffects Updates bounded cadence evidence and clears only the previous frame's named CPU costs.
	 */
	beginFrame(netzachNowMs) {
		this.netzachEvidence.beginFrame(netzachNowMs);
	}

	/**
	 * @description Measures one synchronous rendered-frame subsystem without changing its return value or semantics.
	 * @param {string} hodName - Stable cost label such as `simulation`, `emitter`, or `render`.
	 * @param {Function} tiferesCallback - Synchronous subsystem work.
	 * @returns {*} Callback result unchanged.
	 * @sideEffects Adds measured CPU milliseconds to current-frame cost evidence.
	 */
	measure(hodName, tiferesCallback) {
		return this.netzachEvidence.measure(hodName, tiferesCallback);
	}

	/**
	 * @description Ends one rendered frame and evaluates expensive percentile/quality policy only when Hod cadence opens.
	 * @param {number} netzachNowMs - Monotonic RAF timestamp in milliseconds.
	 * @returns {object} Latest immutable performance snapshot, reused between evaluation windows.
	 * @sideEffects May evaluate pressure and resize only the native framebuffer when quality policy requests a new scale.
	 */
	endFrame(netzachNowMs) {
		if (!this.hodCadence.shouldEvaluate(netzachNowMs)) return this.hodLatest;
		const hodEvidence = this.netzachEvidence.view();
		const gevurahQuality = this.gevurahQuality.evaluate(hodEvidence.frame, netzachNowMs);
		if (gevurahQuality.changed) this.yesodRenderScale?.setScale?.(gevurahQuality.scale);
		this.hodLatest = Object.freeze({
			pressure: gevurahQuality.pressure,
			renderScale: gevurahQuality.scale,
			averageFps: hodEvidence.frame.averageFps,
			p95Ms: hodEvidence.frame.p95Ms,
			onePercentLowFps: hodEvidence.frame.onePercentLowFps,
			hardMissRate: hodEvidence.frame.hardMissRate,
			samples: hodEvidence.frame.samples,
			dominantFrameCost: hodEvidence.costs.dominant,
			measuredCpuMs: hodEvidence.costs.totalMs,
			evaluationCount: this.hodCadence.view().evaluationCount,
			maximumAcceptedFrameIntervalMs: hodEvidence.suspension.maximumAcceptedFrameIntervalMs,
			rejectedSuspensionGaps: hodEvidence.suspension.rejectedSuspensionGaps,
			recommendations: Object.freeze([...gevurahQuality.recommendations])
		});
		return this.hodLatest;
	}

	/**
	 * @description Returns the latest immutable plain performance evidence for diagnostics and UI projection.
	 * @returns {object} Latest frozen performance snapshot.
	 * @sideEffects None.
	 */
	view() {
		return this.hodLatest;
	}

	/**
	 * @description Creates stable pre-evidence defaults before enough rendered frames exist for pressure classification.
	 * @returns {object} Frozen initial performance snapshot.
	 * @sideEffects None.
	 */
	initialSnapshot() {
		const hodSuspension = this.netzachEvidence.view().suspension;
		return Object.freeze({
			pressure: "stable",
			renderScale: this.gevurahQuality.view().scale,
			averageFps: 0,
			p95Ms: 0,
			onePercentLowFps: 0,
			hardMissRate: 0,
			samples: 0,
			dominantFrameCost: null,
			measuredCpuMs: 0,
			evaluationCount: 0,
			maximumAcceptedFrameIntervalMs: hodSuspension.maximumAcceptedFrameIntervalMs,
			rejectedSuspensionGaps: 0,
			recommendations: Object.freeze(["preserve-quality"])
		});
	}
}
