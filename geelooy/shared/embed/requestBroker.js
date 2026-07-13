//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * A request waits only within a measured vessel. The Awtsmoos renews waiting,
 * answer, and timeout alike; Awtsmoos.com bounds every promise and removes
 * every completed, failed, or abandoned request from memory.
 */

const DEFAULT_TIMEOUT_MILLISECONDS = 10000;
const DEFAULT_PENDING_LIMIT = 100;

/** Owns correlated request promises for one embed endpoint. */
export class EmbedRequestBroker {
	/** Configures timer functions, timeout, and maximum pending requests. */
	constructor(options = {}) {
		this.timeoutMilliseconds = options.timeoutMilliseconds
			|| DEFAULT_TIMEOUT_MILLISECONDS;
		this.pendingLimit = options.pendingLimit || DEFAULT_PENDING_LIMIT;
		this.setTimer = options.setTimer || globalThis.setTimeout.bind(globalThis);
		this.clearTimer = options.clearTimer || globalThis.clearTimeout.bind(globalThis);
		this.pending = new Map();
	}

	/** Opens one bounded pending request. */
	open(requestId, type) {
		if (this.pending.size >= this.pendingLimit) {
			throw new Error("embed_pending_limit_reached");
		}
		return new Promise((resolve, reject) => {
			const timer = this.setTimer(() => {
				this.pending.delete(requestId);
				reject(new Error(`embed_request_timeout:${type}`));
			}, this.timeoutMilliseconds);
			this.pending.set(requestId, { resolve, reject, timer, type });
		});
	}

	/** Resolves or rejects the matching response and clears its timeout. */
	settle(envelope) {
		const record = this.take(envelope.requestId);
		if (!record) {
			return false;
		}
		if (envelope.ok === false) {
			record.reject(embedResponseError(envelope));
		} else {
			record.resolve(envelope.payload || {});
		}
		return true;
	}

	/** Rejects one pending request immediately after a local transport failure. */
	reject(requestId, error) {
		const record = this.take(requestId);
		if (!record) {
			return false;
		}
		record.reject(error instanceof Error ? error : new Error(String(error)));
		return true;
	}

	/** Rejects and removes every pending request during endpoint shutdown. */
	close(reason = "embed_endpoint_closed") {
		for (const record of this.pending.values()) {
			this.clearTimer(record.timer);
			record.reject(new Error(reason));
		}
		this.pending.clear();
	}

	/** Returns the current bounded pending count for diagnostics and tests. */
	size() {
		return this.pending.size;
	}

	take(requestId) {
		const record = this.pending.get(requestId);
		if (!record) {
			return null;
		}
		this.pending.delete(requestId);
		this.clearTimer(record.timer);
		return record;
	}
}

function embedResponseError(envelope) {
	const error = new Error(
		envelope.error?.message || "Embedded request failed"
	);
	error.code = envelope.error?.code || "embed_response_error";
	error.detail = envelope.error?.detail || {};
	return error;
}
