// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_FINALIZATION_LEASE_MS = 60000;
const MAX_FINALIZATION_LEASE_MS = 300000;

/**
 * @file Renews registry testimony while normal terminal persistence completes.
 * @description
 * A child may have finished while disk still gathers its last letters. The
 * Awtsmoos grants that ending one bounded breath, so Awtsmoos.com never calls a
 * witnessed exit a lost worker merely because durable finalization is slower.
 */
function renew(live, value = new Date().toISOString(), options = {}) {
	if (!live?.meta) return null;
	const startedAt = normalizedIso(value);
	const leaseMs = boundedLease(options.leaseMs);
	const leaseExpiresAt = new Date(
		Date.parse(startedAt) + leaseMs
	).toISOString();
	live.meta.finalizationStartedAt = startedAt;
	live.meta.finalizationLeaseExpiresAt = leaseExpiresAt;
	live.meta.heartbeatAt = startedAt;
	live.registry?.updateWorker?.(live.meta.workerId, {
		state: "finalizing",
		heartbeatAt: startedAt,
		deadlineAt: leaseExpiresAt,
		leaseExpiresAt
	});
	return {
		startedAt,
		leaseExpiresAt,
		leaseMs
	};
}

function boundedLease(value) {
	const requested = Number(
		value ||
		process.env.AWTSMOOS_COMMAND_FINALIZATION_LEASE_MS ||
		DEFAULT_FINALIZATION_LEASE_MS
	);
	const normalized = Number.isFinite(requested)
		? Math.floor(requested)
		: DEFAULT_FINALIZATION_LEASE_MS;
	return Math.max(
		1000,
		Math.min(MAX_FINALIZATION_LEASE_MS, normalized)
	);
}

function normalizedIso(value) {
	const parsed = Date.parse(value || "");
	return Number.isFinite(parsed)
		? new Date(parsed).toISOString()
		: new Date().toISOString();
}

module.exports = {
	DEFAULT_FINALIZATION_LEASE_MS,
	MAX_FINALIZATION_LEASE_MS,
	boundedLease,
	renew
};
