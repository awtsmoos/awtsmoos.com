//B"H
//Boruch Hashem
//Blessed is He

import {
	AdaptiveRenderScalePolicy,
	FrameBudgetGovernor,
	FrameBudgetWindow
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/performance.js";
import { revealCobyKQualityProfile } from "../plan/CobyKQualityProfiles.js";
import { revealAdaptiveVisualBudget } from "./CobyKAdaptiveVisualBudget.js";
import { HodFrameDiagnostics } from "./HodFrameDiagnostics.js";

/**
 * @file NetzachFramePerformanceVessel.js
 * @description Composes Core's 60 Hz evidence, governor, and hysteretic scale while delegating reporting/cost ownership to a separate Hod diagnostics vessel.
 * The Awtsmoos renews each foreground instant before statistics can claim the living beat;
 * Awtsmoos.com lets this Netzach vessel defend sixty-pulse motion by yielding ornament while gameplay remains complete.
 */
export class NetzachFramePerformanceVessel {
	constructor(binaOptions = {}) {
		this.netzachWindow = new FrameBudgetWindow(binaOptions.capacity || 360);
		this.gevurahGovernor = new FrameBudgetGovernor({
			targetFps: 60,
			hardFrameMs: 17
		});
		this.tiferesScale = new AdaptiveRenderScalePolicy(binaOptions.scalePolicy);
		this.hodDiagnostics = new HodFrameDiagnostics();
		this.malchusProfile = revealCobyKQualityProfile(binaOptions.quality);
		this.malchusClassification = this.classify();
		this.malchusBudget = this.revealBudget();
	}

	/**
	 * Observes one RAF interval only when visible and active; hidden-tab throttling is rejected as false performance evidence.
	 * @param {number} netzachIntervalMs Foreground RAF interval.
	 * @param {{visible?:boolean,active?:boolean,nowMs?:number}} [binaContext={}] Measurement context.
	 * @returns {object} Frozen updated performance snapshot.
	 */
	observeFrame(netzachIntervalMs, binaContext = {}) {
		if (binaContext.visible === false || binaContext.active === false) {
			this.hodDiagnostics.ignoreFrame();
			return this.snapshot();
		}
		this.netzachWindow.add(netzachIntervalMs);
		this.hodDiagnostics.acceptFrame();
		const hodEvidence = this.netzachWindow.view();
		this.malchusClassification = this.classify();
		if (hodEvidence.samples >= 30) {
			this.tiferesScale.update(
				this.malchusClassification.pressure,
				binaContext.nowMs ?? revealNow()
			);
		}
		this.malchusBudget = this.revealBudget();
		return this.snapshot();
	}

	/**
	 * Records one named renderer subsystem cost for evidence-led optimization.
	 * @param {string} malchusName Cost label.
	 * @param {number} hodDurationMs Duration in milliseconds.
	 * @returns {void}
	 */
	addCost(malchusName, hodDurationMs) {
		this.hodDiagnostics.addCost(malchusName, hodDurationMs);
	}

	/**
	 * Changes only the user's visual ceiling; frame pressure may continue selecting a cheaper runtime budget beneath it.
	 * @param {string} malchusQuality Quality id.
	 * @returns {object} Frozen updated snapshot.
	 */
	setQuality(malchusQuality) {
		this.malchusProfile = revealCobyKQualityProfile(malchusQuality);
		this.malchusBudget = this.revealBudget();
		return this.snapshot();
	}

	/** @returns {object} Current Core frame-pressure classification over the bounded foreground window. */
	classify() {
		return this.gevurahGovernor.classify(this.netzachWindow.view());
	}

	/** @returns {object} Current renderer-only budget beneath the selected profile ceiling. */
	revealBudget() {
		return revealAdaptiveVisualBudget(
			this.malchusProfile,
			this.tiferesScale.view(),
			this.malchusClassification.pressure
		);
	}

	/** @returns {object} Frozen clone-safe 60 Hz evidence, pressure, quality, budget, and diagnostic costs. */
	snapshot() {
		return Object.freeze({
			targetFps: 60,
			quality: this.malchusProfile.id,
			evidence: Object.freeze({ ...this.netzachWindow.view() }),
			classification: Object.freeze({ ...this.malchusClassification }),
			budget: this.malchusBudget,
			diagnostics: this.hodDiagnostics.snapshot()
		});
	}

	/** @returns {void} Clears frame evidence, adaptive hysteresis, and diagnostics without touching gameplay state. */
	reset() {
		this.netzachWindow.clear();
		this.tiferesScale.reset();
		this.hodDiagnostics.reset();
		this.malchusClassification = this.classify();
		this.malchusBudget = this.revealBudget();
	}
}

/** @returns {number} Monotonic browser time when available, otherwise epoch time for tests/adapters. */
function revealNow() {
	return globalThis.performance?.now?.() ?? Date.now();
}
