// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads generation-local parent-admission silence from both attempt and inbox testimony.
 * @description
 * The Awtsmoos distinguishes an old preserved receipt from a current deed awaiting a hand;
 * Awtsmoos.com hears both delivery-attempt and entry-derived witnesses so pre-ready silence cannot stand.
 */
function inspect(mailbox = {}, options = {}) {
	const inbox = mailbox.inbox || {};
	const staleMs = bounded(options.consumerStaleMs, 30000);
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
		? Math.max(1000, Math.min(300000, Math.floor(number)))
		: fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

module.exports = { bounded, inspect, nonnegative };
