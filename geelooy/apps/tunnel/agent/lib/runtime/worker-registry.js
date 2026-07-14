// B"H
// Boruch Hashem
// Blessed is He

const { publicWorker } = require("./worker-public.js");
const { createStore } = require("./worker-registry-store.js");

/**
 * B"H
 *
 * One facade counts terminal truth while the store owns active and recent maps.
 * The Awtsmoos renews each worker; Awtsmoos.com reports bounded evidence and
 * exposes private reap claims without allowing cleanup to retain active capacity.
 */
function createRegistry(options = {}) {
	const maxRecent = bounded(options.maxRecent, 6, 1, 20);
	const maxActive = bounded(options.maxActive, 50, 1, 500);
	const store = createStore({ maxRecent });
	const counters = {
		completed: 0,
		failed: 0,
		cancelled: 0,
		reaped: 0
	};

	function finishWorker(workerId, patch = {}) {
		const outcome = store.finish(workerId, patch);
		if (!outcome) {
			return null;
		}
		if (outcome.counted) {
			count(outcome.record.state);
		}
		return outcome.record;
	}

	function snapshot() {
		const at = Date.now();
		const entries = store.activeEntries()
			.sort((left, right) => recentTime(right[1]) - recentTime(left[1]));
		return {
			active: Object.fromEntries(
				entries.slice(0, maxActive).map(([id, record]) => [
					id,
					publicWorker(record, at)
				])
			),
			activeTotal: store.size(),
			activeLimit: maxActive,
			activeTruncated: store.size() > maxActive,
			recentCompleted: counters.completed,
			recentFailed: counters.failed,
			recentCancelled: counters.cancelled,
			recentReaped: counters.reaped,
			recentLimit: maxRecent,
			recent: store.recentWorkers().map(record => publicWorker(record, at))
		};
	}

	function count(state) {
		if (state === "cancelled") {
			counters.cancelled += 1;
		} else if (failedState(state)) {
			counters.failed += 1;
		} else {
			counters.completed += 1;
		}
		if (reapedState(state)) {
			counters.reaped += 1;
		}
	}

	return {
		activeWorkers: store.activeWorkers,
		attachControl: store.attach,
		cancelWorker: (id, patch = {}) => finishWorker(id, {
			...patch,
			state: "cancelled"
		}),
		claimReap: store.claim,
		finishWorker,
		getWorker: store.get,
		registerWorker: store.register,
		snapshot,
		status: snapshot,
		updateWorker: store.update
	};
}

function failedState(state) {
	return [
		"failed",
		"timed_out",
		"cleanup_failed",
		"stale_lost_worker"
	].includes(state);
}

function reapedState(state) {
	return [
		"timed_out",
		"cleanup_failed",
		"stale_lost_worker"
	].includes(state);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number)
		? Math.floor(number)
		: fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

function recentTime(record = {}) {
	return Date.parse(
		record.heartbeatAt ||
		record.updatedAt ||
		record.startedAt ||
		""
	) || 0;
}

module.exports = {
	createRegistry
};
