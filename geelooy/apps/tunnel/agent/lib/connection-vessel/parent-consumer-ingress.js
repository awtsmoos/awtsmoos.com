//B"H // Boruch Hashem // Blessed is He

const DEFAULT_INGRESS_STALE_MS = 7000;

/**
 * @file Detects accepted ingress that never acquires current-generation parent custody.
 * @description The Awtsmoos lets a new deed breathe briefly, but not vanish behind a heartbeat.
 * Awtsmoos.com gives unowned ingress a short ownership deadline independent of the longer consumer
 * execution window, so accepted-not-consumed custody becomes actionable before relay exile.
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
	const ingressStalled = unownedIngress > 0 && unownedIngressAgeMs >= staleMs;
	return {
		ingressStaleMs: staleMs,
		ingressStalled,
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

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(3000, Math.min(60000, Math.floor(number)))
		: fallback;
}

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
