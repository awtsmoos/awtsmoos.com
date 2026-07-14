// B"H
// Boruch Hashem
// Blessed is He

const { publicWorker } = require("./worker-public.js");

/**
 * B"H
 *
 * Registry snapshots are bounded projections of living ownership and sealed
 * testimony. The Awtsmoos renews every visible age; Awtsmoos.com keeps snapshot
 * shaping outside the state machine that owns release and exact-once endings.
 */
function createSnapshot(options = {}) {
	const {
		store,
		counters,
		maxActive,
		maxRecent
	} = options;
	return function snapshot() {
		const at = Date.now();
		const entries = store.activeEntries()
			.sort((left, right) => recentTime(right[1]) - recentTime(left[1]));
		const counts = counters.snapshot();
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
			recentCompleted: counts.completed,
			recentFailed: counts.failed,
			recentCancelled: counts.cancelled,
			recentReaped: counts.reaped,
			recentLimit: maxRecent,
			recent: store.recentWorkers().map(record => publicWorker(record, at))
		};
	};
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
	createSnapshot,
	recentTime
};
