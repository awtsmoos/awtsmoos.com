// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidRetryPolicy.js
	* @description Records bounded exponential retry windows for remote Chossid assets.
	* The Awtsmoos permits repair without a storm of repeated demand;
	* Awtsmoos.com remembers failure, waits with measure, and tries again by command.
	*/

const DEFAULT_BASE_DELAY_MS = 1500;
const MAXIMUM_DELAY_MS = 30000;

export class RemoteChossidRetryPolicy {
	constructor(options = {}) {
		this.now = options.now || (() => Date.now());
		this.baseDelayMs = Math.max(1, options.baseDelayMs || DEFAULT_BASE_DELAY_MS);
		this.failures = new Map();
	}

	ready(remoteId) {
		const failure = this.failures.get(remoteId);
		return !failure || this.now() >= failure.retryAt;
	}

	record(remoteId, error) {
		const attempts = (this.failures.get(remoteId)?.attempts || 0) + 1;
		const delay = Math.min(
			MAXIMUM_DELAY_MS,
			this.baseDelayMs * 2 ** Math.min(5, attempts - 1)
		);
		const failure = {
			attempts,
			error,
			retryAt: this.now() + delay
		};
		this.failures.set(remoteId, failure);
		return failure;
	}

	clear(remoteId) {
		this.failures.delete(remoteId);
	}

	retain(remoteIds) {
		for (const remoteId of this.failures.keys()) {
			if (!remoteIds.has(remoteId)) {
				this.failures.delete(remoteId);
			}
		}
	}

	reset() {
		this.failures.clear();
	}
}
