// B"H
// Boruch Hashem
// Blessed is He

const Await = require("./worker-reap-await.js");
const Deadline = require("./worker-reap-deadline.js");

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_REAP_TIMEOUT_MS = 15000;

/**
 * B"H
 *
 * The reaper lives outside command execution lanes. The Awtsmoos renews each
 * lease; Awtsmoos.com removes expired ownership before cleanup and merges late
 * evidence into one terminal record, even when the cleanup callback never returns.
 */
function createWorkerReaper(registry, options = {}) {
	const intervalMs = Deadline.positive(
		options.intervalMs,
		DEFAULT_INTERVAL_MS
	);
	const reapTimeoutMs = Deadline.positive(
		options.reapTimeoutMs,
		DEFAULT_REAP_TIMEOUT_MS
	);
	const state = {
		running: false,
		ticking: false,
		lastTickAt: null,
		lastReapAt: null,
		totalReaped: 0,
		totalTimeouts: 0,
		timer: null
	};

	async function reapWorker(workerId, request = {}) {
		const reason = request.reason || "worker_reap_requested";
		const status = request.status || "cancelled";
		const claimed = registry.claimReap(workerId, {
			reapReason: reason,
			reapRequestedStatus: status
		});
		if (!claimed.claimed) {
			return {
				ok: true,
				claimed: false,
				record: claimed.record
			};
		}
		state.totalReaped += 1;
		state.lastReapAt = new Date().toISOString();
		const outcome = claimed.control?.reap
			? await Await.settleWithin(
				() => claimed.control.reap({
					...request,
					reason,
					status
				}),
				reapTimeoutMs
			)
			: {
				ok: false,
				timedOut: false,
				error: "worker_reap_control_missing"
			};
		if (outcome.timedOut) {
			state.totalTimeouts += 1;
		}
		const patch = terminalPatch(status, reason, outcome);
		return {
			ok: outcome.ok,
			claimed: true,
			outcome,
			record: registry.finishWorker(workerId, patch)
		};
	}

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
					expiration: Deadline.expiration(record, options)
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
			reapTimeoutMs,
			lastTickAt: state.lastTickAt,
			lastReapAt: state.lastReapAt,
			totalReaped: state.totalReaped,
			totalTimeouts: state.totalTimeouts
		};
	}

	return {
		reapWorker,
		start,
		status,
		stop,
		tick
	};
}

function terminalPatch(requestedStatus, reason, outcome) {
	const result = outcome.result || {};
	const state = outcome.ok
		? result.status || requestedStatus
		: "cleanup_failed";
	return {
		...result,
		state,
		reaping: false,
		reaped: true,
		reapReason: reason,
		reapFinishedAt: new Date().toISOString(),
		reapTimedOut: outcome.timedOut === true,
		error: outcome.ok ? result.error : outcome.error
	};
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	DEFAULT_REAP_TIMEOUT_MS,
	createWorkerReaper,
	terminalPatch
};
