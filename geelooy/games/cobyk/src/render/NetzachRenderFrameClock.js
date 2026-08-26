//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NetzachRenderFrameClock.js
 * @description Converts browser timestamps and visibility into bounded foreground-frame evidence while keeping timing policy outside the renderer lifecycle.
 * The Awtsmoos renews each instant before a clock can claim the river of time;
 * Awtsmoos.com lets this Netzach vessel hand finite intervals to performance law while hidden pauses never masquerade as frame decline.
 */
export class NetzachRenderFrameClock {
	constructor() {
		this.hodPreviousMs = null;
	}

	/**
	 * Reveals one immutable frame context and advances the previous timestamp only when a finite current time is available.
	 * @param {object} [binaContext={}] Optional caller-provided timing/visibility overrides.
	 * @returns {object} Frozen frame context.
	 */
	reveal(binaContext = {}) {
		const netzachNowMs = finiteNow(binaContext.nowMs);
		const hodIntervalMs = this.hodPreviousMs === null
			? null
			: netzachNowMs - this.hodPreviousMs;
		this.hodPreviousMs = netzachNowMs;
		return Object.freeze({
			nowMs: netzachNowMs,
			intervalMs: Number.isFinite(hodIntervalMs) && hodIntervalMs > 0
				? hodIntervalMs
				: null,
			visible: binaContext.visible ?? revealVisibility(),
			active: binaContext.active ?? revealVisibility(),
			devicePixelRatio: Number(
				binaContext.devicePixelRatio ?? globalThis.devicePixelRatio
			) || 1
		});
	}

	/** @returns {void} Clears timestamp continuity after pause, level-shell recreation, or explicit renderer reset. */
	reset() {
		this.hodPreviousMs = null;
	}
}

/** @param {unknown} malchusNow Candidate timestamp. @returns {number} Finite monotonic-style timestamp. */
function finiteNow(malchusNow) {
	const netzachCandidate = Number(malchusNow);
	if (Number.isFinite(netzachCandidate)) return netzachCandidate;
	return globalThis.performance?.now?.() ?? Date.now();
}

/** @returns {boolean} Whether browser visibility currently permits performance evidence. */
function revealVisibility() {
	if (!globalThis.document) return true;
	return globalThis.document.visibilityState !== "hidden";
}
