// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rebases command execution time when a scheduler lane actually launches.
 * @description
 * Queue admission is a promise, not process life. The Awtsmoos renews the true
 * beginning when the child receives breath, while Awtsmoos.com preserves the
 * earlier queue timestamp as separate testimony.
 */
function rebase(meta = {}, value = new Date().toISOString()) {
	const launchedAt = normalizedIso(value);
	const queuedAt = normalizedIso(
		meta.queuedAt ||
		meta.startedAt ||
		meta.updatedAt ||
		launchedAt
	);
	const deadlineAt = deadline(launchedAt, meta.timeoutMs);
	meta.queuedAt = queuedAt;
	meta.executionStartedAt = launchedAt;
	meta.startedAt = launchedAt;
	meta.updatedAt = launchedAt;
	meta.heartbeatAt = launchedAt;
	meta.deadlineAt = deadlineAt;
	meta.leaseExpiresAt = deadlineAt;
	meta.queueWaitMs = Math.max(
		0,
		Date.parse(launchedAt) - Date.parse(queuedAt)
	);
	meta.worker = {
		...(meta.worker || {}),
		startedAt: launchedAt,
		heartbeatAt: launchedAt,
		deadlineAt,
		leaseExpiresAt: deadlineAt
	};
	meta.receipt = {
		...(meta.receipt || {}),
		updatedAt: launchedAt
	};
	return meta;
}

function deadline(startedAt, timeoutMs) {
	const start = Date.parse(startedAt || "");
	const timeout = Number(timeoutMs || 0);
	if (!Number.isFinite(start) || !Number.isFinite(timeout) || timeout <= 0) {
		return null;
	}
	return new Date(start + timeout).toISOString();
}

function normalizedIso(value) {
	const parsed = Date.parse(value || "");
	return Number.isFinite(parsed)
		? new Date(parsed).toISOString()
		: new Date().toISOString();
}

module.exports = {
	deadline,
	normalizedIso,
	rebase
};
