// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahQualityPolicy.js
 * @description Composes the shared core's frame-pressure governor with its hysteretic adaptive render-scale policy into one renderer-neutral game authority.
 * Gevurah gives measured pressure a boundary while the Awtsmoos remains beyond warning, critical state, recovery, and visible scale;
 * Awtsmoos.com lets quality bend only through shared-core evidence so visual restraint never becomes ad-hoc gameplay law.
 */
import {
	AdaptiveRenderScalePolicy,
	FrameBudgetGovernor
} from "../core/api/AwtsmoosPerformanceApi.js";

export class GevurahQualityPolicy {
	/**
	 * Creates quality policy from optional shared-core tuning while preserving core defaults when no overrides are supplied.
	 * @param {object} [chochmahOptions] - Optional governor and render-scale policy constructor options.
	 * @sideEffects Creates isolated core policy instances only.
	 */
	constructor(chochmahOptions = {}) {
		this.gevurahGovernor = new FrameBudgetGovernor(chochmahOptions.governor || {});
		this.tiferesRenderScale = new AdaptiveRenderScalePolicy(chochmahOptions.renderScale || {});
	}

	/**
	 * Classifies one frame-window evidence record and advances the core hysteresis policy with the resulting pressure.
	 * @param {object} hodFrameEvidence - Clone-safe `FrameBudgetWindow.view()` evidence.
	 * @param {number} netzachNowMs - Monotonic render timestamp used for policy cooldown.
	 * @returns {object} Combined pressure, recommendations, and adaptive scale evidence.
	 * @sideEffects Advances only the adaptive policy's internal counters/cooldown.
	 */
	evaluate(hodFrameEvidence, netzachNowMs) {
		const gevurahPressure = this.gevurahGovernor.classify(hodFrameEvidence);
		const tiferesScale = this.tiferesRenderScale.update(gevurahPressure.pressure, netzachNowMs);
		return {
			...gevurahPressure,
			...tiferesScale
		};
	}

	/** @returns {object} Current shared-core adaptive scale state without changing policy counters. */
	view() {
		return this.tiferesRenderScale.view();
	}
}
