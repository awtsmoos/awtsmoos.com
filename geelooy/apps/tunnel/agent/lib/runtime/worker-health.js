// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_STALE_HEARTBEAT_MS = 45000;

/**
	* @file Separates living worker health, bounded recent outcomes, and lifetime history.
	* @description
	* The Awtsmoos does not let yesterday's failed test become today's broken tunnel.
	* Awtsmoos.com reports active danger as health and sealed endings as history.
	*/
function project(input = {}) {
	const active = normalizeActive(input.active);
	const recent = Array.isArray(input.recent) ? input.recent : [];
	const current = currentHealth(active, input.staleHeartbeatMs);
	const recentWindow = countStates(recent);
	const history = historyCounts(input);
	return {
		current,
		health: {
			ok: current.currentFailures === 0 &&
				current.staleHeartbeats === 0 &&
				current.reaping === 0,
			currentFailures: current.currentFailures,
			staleHeartbeats: current.staleHeartbeats,
			reaping: current.reaping
		},
		recentWindow,
		history
	};
}

function currentHealth(active = {}, staleHeartbeatMs = DEFAULT_STALE_HEARTBEAT_MS) {
	const workers = Object.values(active);
	const threshold = positive(staleHeartbeatMs, DEFAULT_STALE_HEARTBEAT_MS);
	return {
		active: workers.length,
		running: workers.filter(worker => worker.state === "running").length,
		currentFailures: workers.filter(worker => ["failed", "timed_out"].includes(worker.state)).length,
		staleHeartbeats: workers.filter(worker => {
			const age = Number(worker.heartbeatAgeMs || 0);
			return age > threshold;
		}).length,
		reaping: workers.filter(worker => worker.reaping === true).length
	};
}

function countStates(records = []) {
	const counts = { completed: 0, failed: 0, cancelled: 0, reaped: 0 };
	for (const record of records) {
		if (record?.state === "completed") counts.completed += 1;
		if (["failed", "timed_out"].includes(record?.state)) counts.failed += 1;
		if (record?.state === "cancelled") counts.cancelled += 1;
		if (record?.reaped === true || record?.state === "reaped") counts.reaped += 1;
	}
	return counts;
}

function historyCounts(input = {}) {
	const source = input.history || {};
	return {
		completed: number(source.completed ?? input.totalCompleted ?? input.recentCompleted),
		failed: number(source.failed ?? input.totalFailed ?? input.recentFailed),
		cancelled: number(source.cancelled ?? input.totalCancelled ?? input.recentCancelled),
		reaped: number(source.reaped ?? input.totalReaped ?? input.recentReaped)
	};
}

function normalizeActive(active) {
	if (Array.isArray(active)) {
		return Object.fromEntries(active.map((worker, index) => [
			worker.workerId || `worker-${index}`,
			worker
		]));
	}
	return active && typeof active === "object" ? active : {};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function number(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

module.exports = {
	DEFAULT_STALE_HEARTBEAT_MS,
	countStates,
	currentHealth,
	historyCounts,
	normalizeActive,
	project
};
