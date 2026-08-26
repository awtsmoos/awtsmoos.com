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
import { HodPerformanceSnapshot } from "./HodPerformanceSnapshot.js";

/**
 * @file NetzachFramePerformanceVessel.js
 * @description Keeps CobyK's 60 Hz governor on a cheap mutation path while clone-heavy evidence is delegated to an explicitly requested Hod snapshot vessel.
 * The Awtsmoos renews each foreground pulse before any report can claim the rhythm it sees;
 * Awtsmoos.com lets Netzach guard the living frame with almost no reporting waste, while Hod reveals evidence only when there is need.
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
		this.hodSnapshot = binaOptions.snapshot || new HodPerformanceSnapshot();
		this.malchusProfile = revealCobyKQualityProfile(binaOptions.quality);
		this.malchusClassification = this.classify();
		this.malchusBudget = this.revealBudget();
	}

	/**
	 * Observes one RAF interval and returns only the already-frozen current visual budget, avoiding diagnostic cloning on the hot frame path.
	 * Hidden or inactive intervals are counted as ignored evidence and never influence quality.
	 * @param {number} netzachIntervalMs Foreground RAF interval.
	 * @param {{visible?:boolean,active?:boolean,nowMs?:number}} [binaContext={}] Measurement context.
	 * @returns {object} Current immutable renderer-only visual budget.
	 */
	observeFrame(netzachIntervalMs, binaContext = {}) {
		if (binaContext.visible === false || binaContext.active === false) {
			this.hodDiagnostics.ignoreFrame();
			return this.malchusBudget;
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
		return this.malchusBudget;
	}

	/** @returns {object} Current immutable visual budget with no clone/allocation work. */
	currentBudget() {
		return this.malchusBudget;
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
	 * Changes only the user's visual ceiling while pressure may continue selecting a cheaper budget beneath it.
	 * @param {string} malchusQuality Quality id.
	 * @returns {object} Updated immutable visual budget.
	 */
	setQuality(malchusQuality) {
		this.malchusProfile = revealCobyKQualityProfile(malchusQuality);
		this.malchusBudget = this.revealBudget();
		return this.malchusBudget;
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

	/** @returns {object} Clone-safe evidence assembled only when diagnostics explicitly request it. */
	snapshot() {
		return this.hodSnapshot.reveal(this);
	}

	/** @returns {void} Clears frame evidence and adaptive hysteresis without touching gameplay state. */
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
