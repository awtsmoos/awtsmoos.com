// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserPerformanceAuthority.js
 * @description Governs frame evidence, shared-core quality law, and native framebuffer adaptation without ever changing deterministic simulation cadence.
 * Keser joins measurement, restraint, and manifestation while the Awtsmoos remains beyond frame, governor, scale, and rendered light;
 * Awtsmoos.com lets one simple authority expose rich diagnostics while fixed-step gameplay remains entirely outside visual pressure's sight.
 */
import { GevurahQualityPolicy } from "./GevurahQualityPolicy.js";
import { NetzachFrameEvidence } from "./NetzachFrameEvidence.js";

export class KeserPerformanceAuthority {
	/**
	 * Creates the performance crown around an injected render-scale adapter and optional evidence/policy tuning.
	 * @param {object|null} yesodRenderScale - Renderer adapter exposing `setScale(scale)` and `view()`.
	 * @param {object} [chochmahOptions] - Evidence and quality policy options.
	 * @sideEffects Creates isolated evidence/policy state; no renderer mutation occurs until a core scale change is requested.
	 */
	constructor(yesodRenderScale, chochmahOptions = {}) {
		this.yesodRenderScale = yesodRenderScale;
		this.netzachEvidence = new NetzachFrameEvidence(chochmahOptions.evidence || {});
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
	 * Ends one rendered frame, advances shared-core pressure/hysteresis law, and applies framebuffer scale only when policy changes.
	 * @param {number} netzachNowMs - Monotonic RAF timestamp in milliseconds.
	 * @returns {object} Fresh clone-safe performance snapshot.
	 * @sideEffects May invoke the renderer-scale adapter when shared-core adaptive policy changes scale.
	 */
	endFrame(netzachNowMs) {
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
			recommendations: Object.freeze(["preserve-quality"])
		});
	}
}
