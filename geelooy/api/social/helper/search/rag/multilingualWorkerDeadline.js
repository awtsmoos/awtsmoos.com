// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultilingualWorkerDeadline
 * @description
 * Semantic warmup and live inference receive separate finite clocks. A cold
 * model may continue warming after a caller leaves, but no public request may
 * wait without a measured boundary or confuse warming with permanent failure.
 */

const READY_TIMEOUT_MS = 5000;
const QUERY_TIMEOUT_MS = 15000;

/** Builds one stable semantic-worker error carrying a machine-readable code. */
function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

/**
 * Waits for one shared worker-start promise while bounding only this caller.
 * The underlying worker remains alive after timeout so later requests can use it.
 */
async function waitForWorker(startWorker, timeoutMs = READY_TIMEOUT_MS) {
	let timer = null;
	try {
		return await Promise.race([
			startWorker(),
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(codedError(
					'MULTILINGUAL_WORKER_WARMING',
					'Semantic search is warming. Retry shortly.'
				)), timeoutMs);
			})
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

module.exports = {
	QUERY_TIMEOUT_MS,
	READY_TIMEOUT_MS,
	codedError,
	waitForWorker
};
