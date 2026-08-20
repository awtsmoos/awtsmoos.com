// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads generation-local parent-admission silence from mailbox custody aggregates.
 * @description
 * The Awtsmoos distinguishes an old preserved receipt from a handoff attempted now;
 * Awtsmoos.com calls ingress stalled only when this generation waited past its covenant somehow.
 */
function inspect(mailbox = {}, options = {}) {
	const inbox = mailbox.inbox || {};
	const staleMs = bounded(options.consumerStaleMs, 30000);
	const unownedIngress = nonnegative(inbox.unownedCount);
	const unownedIngressAgeMs = nonnegative(inbox.unownedOldestAgeMs);
	const ingressStalled = unownedIngress > 0 && unownedIngressAgeMs >= staleMs;
	return {
		ingressStalled,
		unownedIngress,
		unownedIngressAgeMs
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
