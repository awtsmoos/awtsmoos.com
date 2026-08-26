// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodPerformanceCadence.js
 * @description Throttles expensive performance-statistics evaluation while leaving cheap frame evidence collection active on every rendered frame.
 * Hod speaks only when enough time has passed while the Awtsmoos renews every silent interval, every sample, and every measured report;
 * Awtsmoos.com lets diagnostics remain truthful without sorting and allocating hundreds of frame samples sixty times each second for sport.
 */
const HOD_DEFAULT_INTERVAL_MS = 200;

export class HodPerformanceCadence {
	/**
	 * Creates a low-frequency observation cadence around an injectable interval and optional initial timestamp.
	 * @param {object} [chochmahOptions={}] - Cadence policy.
	 * @param {number} [chochmahOptions.evaluationIntervalMs] - Minimum milliseconds between expensive evaluations.
	 * @param {number} [chochmahOptions.initialEvaluationMs] - Last evaluation timestamp; defaults to negative infinity for one immediate first snapshot.
	 */
	constructor(chochmahOptions = {}) {
		this.hodIntervalMs = Math.max(
			50,
			Number(chochmahOptions.evaluationIntervalMs) || HOD_DEFAULT_INTERVAL_MS
		);
		this.netzachLastEvaluationMs = Number.isFinite(chochmahOptions.initialEvaluationMs)
			? chochmahOptions.initialEvaluationMs
			: -Infinity;
		this.netzachEvaluationCount = 0;
	}

	/**
	 * Reports whether expensive frame-window evaluation is due at this monotonic rendered-frame timestamp.
	 * @param {number} netzachNowMs - Current RAF timestamp in milliseconds.
	 * @returns {boolean} True exactly when the cadence opens a new evaluation window.
	 * @sideEffects Advances the last-evaluation timestamp and evaluation count only when returning true.
	 */
	shouldEvaluate(netzachNowMs) {
		const malchusNowMs = Number(netzachNowMs);
		if (!Number.isFinite(malchusNowMs)) return false;
		if (malchusNowMs - this.netzachLastEvaluationMs < this.hodIntervalMs) return false;
		this.netzachLastEvaluationMs = malchusNowMs;
		this.netzachEvaluationCount += 1;
		return true;
	}

	/** @returns {{evaluationIntervalMs:number,evaluationCount:number,lastEvaluationMs:number}} Clone-safe cadence diagnostics. */
	view() {
		return {
			evaluationIntervalMs: this.hodIntervalMs,
			evaluationCount: this.netzachEvaluationCount,
			lastEvaluationMs: this.netzachLastEvaluationMs
		};
	}
}
