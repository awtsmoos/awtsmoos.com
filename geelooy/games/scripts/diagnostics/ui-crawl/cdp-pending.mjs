//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file cdp-pending.mjs
 * Awtsmoos.com keeps release evidence native, bounded, and inspectable.
 * @description Owns bounded native CDP request promises so socket loss or a missing
 * protocol response cannot strand Games verification in an unsettled top-level await.
 *
 * Invariants:
 * - Every request owns exactly one numeric ID and one finite deadline.
 * - Resolution, protocol rejection, timeout, and transport loss clear the same record.
 * - Transport failure rejects every outstanding request before the process can exit.
 */
export class CdpPendingRequests {
	constructor(timeoutMs = 12000) {
		this.timeoutMs = timeoutMs;
		this.sequence = 0;
		this.records = new Map();
	}

	/** Create one bounded request record and return its wire ID plus promise. */
	create(method) {
		const id = ++this.sequence;
		let resolveTask;
		let rejectTask;
		const promise = new Promise((resolve, reject) => {
			resolveTask = resolve;
			rejectTask = reject;
		});
		const timer = setTimeout(() => {
			this.reject(id, new Error(`CDP request timed out: ${method}`));
		}, this.timeoutMs);
		this.records.set(id, { resolve: resolveTask, reject: rejectTask, timer });
		return { id, promise };
	}

	/** Resolve or reject one request from its protocol response. */
	settle(message) {
		const record = this.records.get(message.id);
		if (!record) {
			return false;
		}
		this.records.delete(message.id);
		clearTimeout(record.timer);
		if (message.error) {
			record.reject(new Error(message.error.message));
		} else {
			record.resolve(message.result || {});
		}
		return true;
	}

	/** Reject one request and clear its deadline. */
	reject(id, error) {
		const record = this.records.get(id);
		if (!record) {
			return;
		}
		this.records.delete(id);
		clearTimeout(record.timer);
		record.reject(error);
	}

	/** Reject every outstanding request after transport loss. */
	rejectAll(error) {
		for (const id of [...this.records.keys()]) {
			this.reject(id, error);
		}
	}
}
