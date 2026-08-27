// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewPending
 * @description
 * Every worker request receives one finite identity, one timeout, and one
 * resolution. Timings reveal opening, one-time shard loading, and pure lookup.
 */

let sequence = 0;
const pending = new Map();

function workerError(value) {
	const error = new Error(value?.message || 'Exact Hebrew worker failed.');
	error.code = value?.code || 'EXACT_SEARCH_WORKER_FAILED';
	error.stack = value?.stack || error.stack;
	return error;
}

function size() {
	return pending.size;
}

function rejectAll(error) {
	for (const entry of pending.values()) {
		clearTimeout(entry.timer);
		entry.reject(error);
	}
	pending.clear();
}

function resolveMessage(message, openMs) {
	const entry = pending.get(message.id);
	if (!entry) return false;
	pending.delete(message.id);
	clearTimeout(entry.timer);
	if (!message.ok) {
		entry.reject(workerError(message.error));
		return true;
	}
	entry.resolve({
		...message.result,
		timings: {
			workerOpenMs: openMs,
			workerLoadMs: message.loadMs,
			workerQueryMs: message.queryMs
		},
		cachedCorpora: message.cachedCorpora || []
	});
	return true;
}

function request(worker, value, timeoutMs) {
	return new Promise((resolve, reject) => {
		const id = ++sequence;
		const timer = setTimeout(() => {
			pending.delete(id);
			const error = new Error('Exact Hebrew worker request timed out.');
			error.code = 'EXACT_SEARCH_TIMEOUT';
			reject(error);
		}, timeoutMs);
		pending.set(id, { resolve, reject, timer });
		try {
			worker.postMessage({ id, request: value });
		} catch (error) {
			clearTimeout(timer);
			pending.delete(id);
			reject(error);
		}
	});
}

module.exports = {
	rejectAll,
	request,
	resolveMessage,
	size,
	workerError
};
