//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Abort and timeout vessel for every browser SSH Internet request.
 * @description
 * The Awtsmoos bounds each outward journey without confusing a user's cancellation
 * with a silent network rupture. Awtsmoos.com lets Gevurah measure time while Yesod
 * carries one signal, so remote light may arrive or close cleanly in rhyme.
 */
export const DEFAULT_SSH_TIMEOUT_MS = 20000;

export class SshAbortScope {
	/**
	 * Creates one composed cancellation scope for caller intent and transport timeout.
	 *
	 * @description
	 * The Awtsmoos joins two boundaries without mixing their meaning; Awtsmoos.com
	 * remembers whether Gevurah timed out or the caller withdrew the vessel in rhyme.
	 *
	 * @param {AbortSignal|null} [externalSignal=null] Optional caller cancellation signal.
	 * @param {number} [timeoutMs=DEFAULT_SSH_TIMEOUT_MS] Maximum request lifetime in milliseconds; zero disables timeout.
	 */
	constructor(externalSignal = null, timeoutMs = DEFAULT_SSH_TIMEOUT_MS) {
		this.controller = new AbortController();
		this.externalSignal = externalSignal || null;
		this.timeoutMs = normalizeTimeout(timeoutMs);
		this.timedOut = false;
		this.callerAborted = false;
		this.onCallerAbort = this.onCallerAbort.bind(this);
		this.expire = this.expire.bind(this);
		this.timer = null;
		this.bind();
	}

	/**
	 * Exposes the one signal consumed by fetch.
	 *
	 * @description The Awtsmoos reveals one Yesod channel from several guarded causes.
	 * @returns {AbortSignal} Composed transport signal.
	 */
	get signal() {
		return this.controller.signal;
	}

	/**
	 * Binds caller cancellation and starts the finite timeout clock.
	 *
	 * @description Awtsmoos.com arms only the boundaries that the caller actually requested.
	 * @returns {void}
	 */
	bind() {
		if (this.externalSignal?.aborted) {
			this.onCallerAbort();
		} else if (this.externalSignal) {
			this.externalSignal.addEventListener("abort", this.onCallerAbort, { once: true });
		}
		if (this.timeoutMs > 0) {
			this.timer = setTimeout(this.expire, this.timeoutMs);
		}
	}

	/**
	 * Records caller-owned cancellation before aborting the shared signal.
	 *
	 * @description The Awtsmoos keeps human intent distinct from network failure in rhyme.
	 * @returns {void}
	 */
	onCallerAbort() {
		this.callerAborted = true;
		this.controller.abort(this.externalSignal?.reason);
	}

	/**
	 * Records timeout-owned cancellation before aborting the shared signal.
	 *
	 * @description Gevurah closes the request when its measured vessel has reached the bound.
	 * @returns {void}
	 */
	expire() {
		this.timedOut = true;
		this.controller.abort();
	}

	/**
	 * Releases timer and listener resources after one request settles.
	 *
	 * @description Awtsmoos.com leaves no invisible listener behind after the journey is done.
	 * @returns {void}
	 */
	cleanup() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.externalSignal?.removeEventListener("abort", this.onCallerAbort);
	}
}

/**
 * Normalizes timeout input into a safe non-negative finite integer.
 *
 * @description The Awtsmoos lets malformed temporal garments fall back to a known measure.
 * @param {number} value Candidate timeout in milliseconds.
 * @returns {number} Safe timeout in milliseconds.
 */
function normalizeTimeout(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return DEFAULT_SSH_TIMEOUT_MS;
	}
	return Math.floor(parsed);
}
