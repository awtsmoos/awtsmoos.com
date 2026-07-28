// B"H
// Boruch Hashem
// Blessed is He

const Canonical = require("./canonicalEnvelopes.js");
const Expectation = require("./expectation.js");
const Lifecycle = require("./lifecycle.js");
const Retry = require("./retryRequest.js");
const State = require("./state.js");

/**
 * @file Claims or observes one canonical relay deed before socket dispatch.
 * @description
 * The Awtsmoos is one while callers multiply. Awtsmoos.com lets duplicates join
 * one Promise, lets restart read durable truth, and permits native dispatch only
 * after an exclusive canonical claim has survived atomic readback.
 */
async function run(options = {}) {
	const { context, id, expected, retry, waitMs } = options;
	State.ensureStores(context);
	context.tunnelRequestStarts ||= new Map();
	const key = State.durableKey(id, expected);
	const active = context.tunnelRequestStarts.get(key);
	if (active) {
		if (!matches(active.expected, expected, retry)) {
			return Canonical.conflict(active.expected, expected);
		}
		return retry
			? Canonical.pending({ expected: active.expected }, 0)
			: await active.promise;
	}
	const operation = execute(options);
	context.tunnelRequestStarts.set(key, {
		expected,
		promise: operation
	});
	try {
		return await operation;
	} finally {
		if (context.tunnelRequestStarts.get(key)?.promise === operation) {
			context.tunnelRequestStarts.delete(key);
		}
	}
}

async function execute(options) {
	const { context, id, expected, retry, waitMs, producer } = options;
	const pending = context.pendingTunnelRequests.get(id);
	if (pending) return reusePending(pending, expected, retry, waitMs);
	const durable = await State.hydrate(context, id, expected);
	if (durable) return Canonical.fromRecord(durable, expected, waitMs, retry);
	if (retry) return Canonical.unknown(expected);
	const claim = await State.claim(context, id, expected);
	if (!claim.created) {
		return Canonical.fromRecord(claim.record, expected, waitMs, null);
	}
	return await producer();
}

function reusePending(record, expected, retry, waitMs) {
	if (!matches(record.expected, expected, retry)) {
		return Promise.resolve(Canonical.conflict(record.expected, expected));
	}
	return retry
		? Promise.resolve(Canonical.pending(record, 0))
		: Lifecycle.attachWaiter(record, waitMs);
}

function matches(stored, incoming, retry) {
	return retry
		? stored.registrationKey === incoming.registrationKey &&
			Retry.actionMatches(retry, stored)
		: Expectation.sameExpectation(stored, incoming);
}

module.exports = {
	execute,
	matches,
	reusePending,
	run
};
