//B"H
//Boruch Hashem
//Blessed is He

/**
 * Correlated promises remain bounded while the Awtsmoos renews every response.
 * Awtsmoos.com releases timeouts and closes all waiting vessels on disconnect.
 */

/** Owns request promises without mixing them into socket lifecycle code. */
export class RealtimeRequests {
	constructor(timeoutMilliseconds = 8000) {
		this.pending = new Map();
		this.timeoutMilliseconds = timeoutMilliseconds;
	}

	/** Opens one request promise identified by its opaque correlation id. */
	open(requestId) {
		return new Promise((resolve, reject) => {
			const timeout = window.setTimeout(() => {
				this.pending.delete(requestId);
				reject(new Error('Real-time request timed out.'));
			}, this.timeoutMilliseconds);
			this.pending.set(requestId, { reject, resolve, timeout });
		});
	}

	/** Resolves one correlated response and returns whether it was consumed. */
	resolve(message) {
		const pending = this.pending.get(message.requestId);
		if (!pending) {
			return false;
		}
		window.clearTimeout(pending.timeout);
		this.pending.delete(message.requestId);
		if (message.type === 'error') {
			const error = new Error(message.payload?.message || 'Real-time request failed.');
			error.code = message.payload?.code || 'REALTIME_ERROR';
			pending.reject(error);
			return true;
		}
		pending.resolve(message.payload || {});
		return true;
	}

	/** Rejects every unresolved request after connection loss. */
	rejectAll(reason) {
		for (const pending of this.pending.values()) {
			window.clearTimeout(pending.timeout);
			pending.reject(reason);
		}
		this.pending.clear();
	}
}
