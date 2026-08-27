//B"H
// Boruch Hashem
// Blessed is He

/**
 * Time and cancellation are finite vessels around every external call. The
 * Awtsmoos releases their listeners and timers; Awtsmoos.com never leaves a
 * rejected request hanging behind a page that has already moved onward.
 */
export class RequestAbortScope {
	constructor({ signal = null, timeoutMs = 15000 } = {}) {
		this.controller = new AbortController();
		this.code = null;
		this.externalSignal = signal;
		this.externalListener = () => this.abort(
			"GPT_API_ABORTED",
			signal?.reason || new Error("GPT API request was cancelled.")
		);
		if (signal?.aborted) {
			this.externalListener();
		} else {
			signal?.addEventListener("abort", this.externalListener, { once: true });
		}
		this.timeout = Number.isFinite(timeoutMs) && timeoutMs > 0
			? setTimeout(() => this.abort(
				"GPT_API_TIMEOUT",
				new Error("GPT API request timed out.")
			), timeoutMs)
			: null;
	}

	get signal() {
		return this.controller.signal;
	}

	abort(code, reason) {
		if (this.signal.aborted) {
			return;
		}
		this.code = code;
		this.controller.abort(reason);
	}

	async race(promise) {
		if (this.signal.aborted) {
			throw this.signal.reason;
		}
		let removeListener = () => {};
		const aborted = new Promise((resolve, reject) => {
			const listener = () => reject(this.signal.reason);
			this.signal.addEventListener("abort", listener, { once: true });
			removeListener = () => this.signal.removeEventListener("abort", listener);
		});
		try {
			return await Promise.race([promise, aborted]);
		} finally {
			removeListener();
		}
	}

	close() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.externalSignal?.removeEventListener("abort", this.externalListener);
	}
}
