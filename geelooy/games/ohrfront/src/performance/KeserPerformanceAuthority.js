// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserPerformanceAuthority.js
 * @description Governs cheap per-frame evidence, low-frequency percentile evaluation, shared-core quality law, and native framebuffer adaptation without changing deterministic gameplay cadence.
 * Keser joins measurement, silence, and restraint while the Awtsmoos renews every frame before statistic, pressure, or scale can claim a throne;
 * Awtsmoos.com lets evidence speak only often enough to guide quality, so the profiler itself never becomes the stutter it was built to prevent.
 */
import { GevurahQualityPolicy } from "./GevurahQualityPolicy.js";
import { HodPerformanceCadence } from "./HodPerformanceCadence.js";
import { NetzachFrameEvidence } from "./NetzachFrameEvidence.js";

export class KeserPerformanceAuthority {
	/**
	 * Creates the performance crown around an injected render-scale adapter and independently tunable evidence, cadence, and quality policies.
	 * @param {object|null} yesodRenderScale - Renderer adapter exposing `setScale(scale)` and `view()`.
	 * @param {object} [chochmahOptions={}] - Evidence, cadence, and quality policy options.
	 * @sideEffects Creates isolated evidence/policy state; no renderer mutation occurs until a measured scale change is requested.
	 */
	constructor(yesodRenderScale, chochmahOptions = {}) {
		this.yesodRenderScale = yesodRenderScale;
		this.netzachEvidence = new NetzachFrameEvidence(chochmahOptions.evidence || {});
		this.hodCadence = new HodPerformanceCadence(chochmahOptions.cadence || {});
		this.gevurahQuality = new GevurahQualityPolicy(chochmahOptions.quality || {});
		this.hodLatest = this.initialSnapshot();
	}

	/** Begins one rendered frame and clears only per-frame subsystem cost evidence. */
	beginFrame(netzachNowMs) {
		this.netzachEvidence.beginFrame(netzachNowMs);
	}

	/**
	 * Measures one synchronous rendered-frame subsystem without changing its result or execution semantics.
	 * @param {string} hodName - Stable cost label.
	 * @param {Function} tiferesCallback - Synchronous subsystem work.
	 * @returns {*} Callback result unchanged.
	 */
	measure(hodName, tiferesCallback) {
		return this.netzachEvidence.measure(hodName, tiferesCallback);
	}

	/**
	 * Ends one rendered frame while performing expensive frame-window statistics only when the low-frequency Hod cadence opens.
	 * @param {number} netzachNowMs - Monotonic RAF timestamp in milliseconds.
	 * @returns {object} Latest immutable performance snapshot, reused between evaluation windows.
	 * @sideEffects May evaluate shared-core pressure and resize framebuffer only on cadence-approved frames.
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
			recommendations: Object.freeze([...gevurahQuality.recommendations])
		});
		return this.hodLatest;
	}

	/** @returns {object} Latest immutable plain performance evidence for diagnostics/UI projection. */
	view() {
		return this.hodLatest;
	}

	/** @returns {object} Stable initial snapshot used before enough frame evidence exists for pressure classification. */
	initialSnapshot() {
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
			recommendations: Object.freeze(["preserve-quality"])
		});
	}
}
