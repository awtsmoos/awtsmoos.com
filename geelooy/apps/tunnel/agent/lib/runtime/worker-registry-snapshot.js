// B"H
// Boruch Hashem
// Blessed is He

const { publicWorker } = require("./worker-public.js");
const Health = require("./worker-health.js");

/**
	* @file Projects active workers, bounded recent endings, and lifetime totals.
	* @description
	* The Awtsmoos renews living ownership separately from sealed history.
	* Awtsmoos.com retains legacy counter names only as explicit lifetime aliases.
	*/
function createSnapshot(options = {}) {
	const { store, counters, maxActive, maxRecent } = options;
	return function snapshot() {
		const at = Date.now();
		const entries = store.activeEntries()
			.sort((left, right) => recentTime(right[1]) - recentTime(left[1]));
		const active = Object.fromEntries(
			entries.slice(0, maxActive).map(([id, record]) => [
				id,
				publicWorker(record, at)
			])
		);
		const recent = store.recentWorkers().map(record => publicWorker(record, at));
		const counts = counters.snapshot();
		const history = {
			completed: counts.completed,
			failed: counts.failed,
			cancelled: counts.cancelled,
			reaped: counts.reaped
		};
		const projected = Health.project({ active, recent, history });
		return {
			active,
			activeTotal: store.size(),
			activeLimit: maxActive,
			activeTruncated: store.size() > maxActive,
			recentLimit: maxRecent,
			recent,
			...projected,
			totalCompleted: history.completed,
			totalFailed: history.failed,
			totalCancelled: history.cancelled,
			totalReaped: history.reaped,
			recentCompleted: history.completed,
			recentFailed: history.failed,
			recentCancelled: history.cancelled,
			recentReaped: history.reaped,
			legacyCountersAreLifetime: true
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

module.exports = { createSnapshot, recentTime };
