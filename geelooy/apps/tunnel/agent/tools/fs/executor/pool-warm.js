// B"H
// Boruch Hashem
// Blessed is He

/** Begins staged warm-up and returns the immediate pool witness. */
function start(ensureWorkers, stats, minimum) {
	ensureWorkers(minimum);
	return stats();
}

/** Waits for the requested staged warm capacity without blocking the event loop. */
function untilReady(ensureWorkers, stats, state, policy, options = {}) {
	const minimum = Math.max(
		1,
		Math.min(policy.WORKERS, Number(options.minimum || policy.MIN_WORKERS))
	);
	const timeoutMs = Math.max(
		250,
		Math.min(30000, Number(options.timeoutMs || policy.READY_TIMEOUT_MS))
	);
	return new Promise(resolve => {
		const startedAt = Date.now();
		function inspect() {
			ensureWorkers(minimum);
			const current = stats();
			if (current.ready >= minimum) {
				resolve({ ...current, warmReady: true, waitedMs: Date.now() - startedAt });
				return;
			}
			if (Date.now() - startedAt >= timeoutMs || state.stopped) {
				resolve({ ...current, warmReady: false, waitedMs: Date.now() - startedAt });
				return;
			}
			setTimeout(inspect, 20);
		}
		inspect();
	});
}

module.exports = { start, untilReady };
