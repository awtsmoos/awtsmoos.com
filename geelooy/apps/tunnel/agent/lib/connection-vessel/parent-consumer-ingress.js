// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_INGRESS_STALE_MS = 7000;

/**
 * @file Distinguishes active ingress failure from detached historical attempts.
 * @description
 * The Awtsmoos recreates each living request without erasing the old deed;
 * Awtsmoos.com reports detached testimony but does not freeze new work in need.
 * A missing inbox count is never proof of an empty durable queue.
 */
function inspect(mailbox = {}, options = {}) {
	const inbox = mailbox.inbox || {};
	const staleMs = bounded(
		options.ingressStaleMs ?? options.consumerStaleMs,
		DEFAULT_INGRESS_STALE_MS
	);
	const attemptCount = nonnegative(inbox.unownedCount);
	const attemptAgeMs = nonnegative(inbox.unownedOldestAgeMs);
	const entryCount = nonnegative(
		inbox.entryUnownedCount ?? inbox.custodyUnownedCount
	);
	const entryAgeMs = nonnegative(inbox.entryUnownedOldestAgeMs);
	const unownedIngress = Math.max(attemptCount, entryCount);
	const unownedIngressAgeMs = Math.max(attemptAgeMs, entryAgeMs);

	// B"H: an explicitly empty durable inbox cannot be drained by replacing
	// the consumer. Retain every historical witness for exact reconciliation.
	const detachedAttemptDebt = attemptCount > 0 &&
		inbox.count === 0 && inbox.entryUnownedCount === 0;
	const ingressStalled = unownedIngress > 0 &&
		unownedIngressAgeMs >= staleMs && !detachedAttemptDebt;

	return {
		ingressStaleMs: staleMs,
		ingressStalled,
		detachedAttemptDebt,
		detachedAttemptCount: detachedAttemptDebt ? attemptCount : 0,
		unownedIngress,
		unownedIngressAgeMs,
		unownedIngressSources: {
			attemptCount,
			attemptAgeMs,
			entryCount,
			entryAgeMs
		}
	};
}

/** Bounds a noisy configuration without weakening the minimum ownership wait. */
function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(3000, Math.min(60000, Math.floor(number)))
		: fallback;
}

/** Returns only finite nonnegative integer evidence. */
function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

module.exports = {
	DEFAULT_INGRESS_STALE_MS,
	bounded,
	inspect,
	nonnegative
};
