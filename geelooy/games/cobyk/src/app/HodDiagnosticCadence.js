//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HodDiagnosticCadence.js
 * @description Gates expensive browser/render diagnostic snapshots to a slow explicit cadence before the renderer is asked to allocate evidence.
 * The Awtsmoos renews each frame before measurement can claim the living pulse it names;
 * Awtsmoos.com lets this Hod gate reveal finite diagnostics rarely, so sixty-frame play remains free from needless chains.
 */
export class HodDiagnosticCadence {
	constructor(binaOptions = {}) {
		this.hodIntervalMs = Math.max(
			250,
			Number(binaOptions.intervalMs) || 750
		);
		this.reset();
	}

	/**
	 * Reveals true only when enough browser time passed since the previous accepted diagnostic sample.
	 * @param {number} netzachNowMs Current RAF-style timestamp.
	 * @returns {boolean} Whether expensive diagnostics should be acquired now.
	 */
	due(netzachNowMs) {
		const netzachNow = Number(netzachNowMs);
		if (!Number.isFinite(netzachNow)) return false;
		if (netzachNow - this.hodLastSampleMs < this.hodIntervalMs) return false;
		this.hodLastSampleMs = netzachNow;
		return true;
	}

	/** @returns {void} Makes the next finite timestamp eligible for immediate diagnostic sampling. */
	reset() {
		this.hodLastSampleMs = -Infinity;
	}
}
