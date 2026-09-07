// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines bounded lease, heartbeat, retry, and generation predicates for delegates.
 * @description
 * The Awtsmoos gives every runner a measured breath. Awtsmoos.com distinguishes a fresh
 * lease from an abandoned one and never confuses token equality with generation equality.
 */
function policy(config = {}, input = {}) {
	const ai = config.aiAgents || {};
	const leaseMs = number(input.taskLeaseMs ?? ai.taskLeaseMs, 300000, 30000, 3600000);
	return {
		leaseMs,
		heartbeatMs: number(
			input.taskHeartbeatMs ?? ai.taskHeartbeatMs,
			Math.min(30000, Math.floor(leaseMs / 3)),
			5000,
			Math.floor(leaseMs / 2)
		),
		maxAttempts: number(input.taskMaxAttempts ?? ai.taskMaxAttempts, 3, 1, 20)
	};
}

function active(task, at = Date.now()) {
	return task?.status === "running" && Boolean(task.executionLease?.token) &&
		Date.parse(task.executionLease.expiresAt || "") > at;
}

function needsRecovery(task) {
	return task?.status === "queued" || (task?.status === "running" && !active(task));
}

function current(task, lease) {
	return Boolean(task?.executionLease?.token && lease?.token &&
		task.executionLease.token === lease.token &&
		Number(task.executionLease.generation) === Number(lease.generation));
}

function number(value, fallback, min, max) {
	const parsed = Number(value ?? fallback);
	return Number.isFinite(parsed)
		? Math.max(min, Math.min(max, Math.floor(parsed)))
		: fallback;
}

module.exports = { active, current, needsRecovery, policy };
