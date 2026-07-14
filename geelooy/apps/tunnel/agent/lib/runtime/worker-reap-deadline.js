// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_STALE_MS = 45000;
const DEFAULT_DEADLINE_GRACE_MS = 10000;

/**
 * B"H
 *
 * A worker lease has two independent boundaries: its declared command deadline
 * and its latest trustworthy heartbeat. The Awtsmoos renews both measures;
 * Awtsmoos.com names an expired worker without mutating registry or process.
 */
function expiration(record = {}, options = {}) {
	const now = Number(options.now || Date.now());
	const staleMs = positive(
		options.staleMs,
		DEFAULT_STALE_MS
	);
	const deadlineGraceMs = positive(
		options.deadlineGraceMs,
		DEFAULT_DEADLINE_GRACE_MS
	);
	const heartbeatAt = Date.parse(
		record.heartbeatAt ||
		record.startedAt ||
		""
	);
	const deadlineAt = Date.parse(
		record.leaseExpiresAt ||
		record.deadlineAt ||
		""
	);

	if (Number.isFinite(deadlineAt) && now > deadlineAt + deadlineGraceMs) {
		return {
			expired: true,
			reason: "worker_deadline_exceeded",
			status: "timed_out",
			ageMs: now - deadlineAt
		};
	}

	if (Number.isFinite(heartbeatAt) && now - heartbeatAt > staleMs) {
		return {
			expired: true,
			reason: "worker_heartbeat_stale",
			status: "stale_lost_worker",
			ageMs: now - heartbeatAt
		};
	}

	return {
		expired: false,
		reason: null,
		status: record.state || "running",
		ageMs: Number.isFinite(heartbeatAt)
			? Math.max(0, now - heartbeatAt)
			: null
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	DEFAULT_DEADLINE_GRACE_MS,
	DEFAULT_STALE_MS,
	expiration,
	positive
};
