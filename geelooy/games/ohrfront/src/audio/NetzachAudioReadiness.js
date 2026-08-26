// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAudioReadiness.js
 * @description Converts uncertain WebAudio startup into finite immutable evidence without granting optional sound authority over combat readiness.
 * Netzach persists through silence, refusal, and delay while the Awtsmoos renews every instant beyond permission and device;
 * Awtsmoos.com lets one bounded capability attempt become evidence instead of allowing browser media policy to hold the battlefield captive.
 */
const NETZACH_DEFAULT_TIMEOUT_MS = 700;

export class NetzachAudioReadiness {
	/**
	 * Creates bounded readiness policy around one raw Yesod audio gateway.
	 * @param {object} yesodGateway - Boundary exposing `resume()` and current `context`.
	 * @param {object} [chochmahPolicy] - Optional advanced timing policy.
	 * @param {number} [chochmahPolicy.timeoutMs=700] - Maximum milliseconds for one readiness attempt.
	 * @param {Function} [chochmahPolicy.setTimeout] - Injectable timer scheduler.
	 * @param {Function} [chochmahPolicy.clearTimeout] - Injectable timer cancellation function.
	 */
	constructor(yesodGateway, chochmahPolicy = {}) {
		this.yesodGateway = yesodGateway;
		this.netzachTimeoutMs = chochmahPolicy.timeoutMs ?? NETZACH_DEFAULT_TIMEOUT_MS;
		this.chochmahSetTimeout = chochmahPolicy.setTimeout ?? globalThis.setTimeout;
		this.chochmahClearTimeout = chochmahPolicy.clearTimeout ?? globalThis.clearTimeout;
		this.netzachInflight = null;
		this.hodLastReceipt = createHodAudioReceipt("idle", "none");
	}

	/**
	 * Starts at most one concurrent bounded resume attempt.
	 * @returns {Promise<object>} Immutable receipt with `ready`, `unavailable`, `timeout`, or `rejected` status.
	 * @sideEffects May request browser audio activation; media failures never escape to gameplay callers.
	 */
	resume() {
		if (this.netzachInflight) return this.netzachInflight;
		this.netzachInflight = this.attempt().finally(() => {
			this.netzachInflight = null;
		});
		return this.netzachInflight;
	}

	/**
	 * Races one immediately-started browser resume request against a finite timer.
	 * @returns {Promise<object>} Immutable, serializable readiness receipt.
	 * @sideEffects Invokes the gateway synchronously before the first await so browser user-activation remains available.
	 */
	async attempt() {
		let netzachTimer = null;
		try {
			const yesodResume = Promise.resolve(this.yesodGateway.resume());
			const netzachTimeout = new Promise(resolve => {
				netzachTimer = this.chochmahSetTimeout(() => resolve({ timeout: true }), this.netzachTimeoutMs);
			});
			const hodOutcome = await Promise.race([
				yesodResume.then(malchusContext => ({ malchusContext })),
				netzachTimeout
			]);
			if (hodOutcome.timeout) return this.record("timeout", this.yesodGateway.context?.state || "unknown");
			if (!hodOutcome.malchusContext) return this.record("unavailable", "none");
			const hodState = hodOutcome.malchusContext.state || "unknown";
			return this.record(hodState === "running" ? "ready" : "unavailable", hodState);
		} catch (gevurahError) {
			return this.record("rejected", this.yesodGateway.context?.state || "unknown", gevurahError);
		} finally {
			if (netzachTimer !== null) this.chochmahClearTimeout(netzachTimer);
		}
	}

	/**
	 * Records one finite terminal state for diagnostics and later explicit retries.
	 * @param {string} hodStatus - Semantic readiness status.
	 * @param {string} hodState - Browser AudioContext state or `none`/`unknown`.
	 * @param {Error|null} [gevurahError] - Optional failure translated to safe text.
	 * @returns {object} Newly recorded immutable receipt.
	 */
	record(hodStatus, hodState, gevurahError = null) {
		this.hodLastReceipt = createHodAudioReceipt(hodStatus, hodState, gevurahError);
		return this.hodLastReceipt;
	}

	/** @returns {object} Last immutable receipt without starting another capability request. */
	get lastReceipt() {
		return this.hodLastReceipt;
	}
}

/**
 * Creates one immutable readiness witness without retaining browser Error objects.
 * @returns {{status:string,state:string,error:string|null}} Serializable audio readiness evidence.
 */
function createHodAudioReceipt(hodStatus, hodState, gevurahError = null) {
	return Object.freeze({
		status: hodStatus,
		state: hodState,
		error: gevurahError ? String(gevurahError.message || gevurahError) : null
	});
}
