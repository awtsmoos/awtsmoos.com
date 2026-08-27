// B"H
// Boruch Hashem
// Blessed is He

const Deadline = require("./worker-reap-deadline.js");

/**
 * B"H
 *
 * The cadence scans leases outside execution lanes and never overlaps itself.
 * The Awtsmoos renews clock and worker list; Awtsmoos.com limits each pass so
 * a storm of expired workers cannot monopolize the control event loop.
 */
function createReaperLoop(options = {}) {
	const {
		registry,
		reapWorker,
		state,
		intervalMs,
		policy
	} = options;

	async function tick() {
		if (state.ticking) {
			return status();
		}
		state.ticking = true;
		state.lastTickAt = new Date().toISOString();
		try {
			const expired = registry.activeWorkers()
				.map(record => ({
					record,
					expiration: Deadline.expiration(record, policy)
				}))
				.filter(item => item.expiration.expired)
				.slice(0, 20);
			await Promise.allSettled(expired.map(item => reapWorker(
				item.record.workerId,
				item.expiration
			)));
			return {
				...status(),
				expired: expired.length
			};
		} finally {
			state.ticking = false;
		}
	}

	function start() {
		if (state.timer) {
			return status();
		}
		state.running = true;
		state.timer = setInterval(() => {
			void tick().catch(() => {});
		}, intervalMs);
		state.timer.unref?.();
		queueMicrotask(() => void tick().catch(() => {}));
		return status();
	}

	function stop() {
		state.running = false;
		if (state.timer) {
			clearInterval(state.timer);
			state.timer = null;
		}
		return status();
	}

	function status() {
		return {
			running: state.running,
			ticking: state.ticking,
			intervalMs,
			reapTimeoutMs: state.reapTimeoutMs,
			lastTickAt: state.lastTickAt,
			lastReapAt: state.lastReapAt,
			totalReaped: state.totalReaped,
			totalTimeouts: state.totalTimeouts
		};
	}

	return {
		start,
		status,
		stop,
		tick
	};
}

module.exports = {
	createReaperLoop
};
