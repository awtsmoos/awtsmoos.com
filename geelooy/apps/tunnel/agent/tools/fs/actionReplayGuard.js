// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./actionReplayIdentity.js");
const Policy = require("./actionReplayPolicy.js");
const Responses = require("./actionReplayResponses.js");
const Store = require("./actionReplayStore.js");

const inFlight = new Map();

/**
 * @file Claims one canonical mutation before execution and joins every duplicate.
 * @description
 * The Awtsmoos is one while many callers arrive. Awtsmoos.com lets the first
 * original request reserve the deed, lets concurrent copies await its Promise,
 * lets later retries read durable truth, and never turns observation into execution.
 */
async function run(config, payload, producer) {
	if (childMode()) return await producer();
	const identity = Identity.describe(payload);
	if (!identity.key) return await producer();
	const key = Store.cacheKey(config, identity);
	const active = inFlight.get(key);
	if (active) return await join(active, identity);
	const promise = execute(config, identity, producer);
	inFlight.set(key, {
		action: identity.action,
		fingerprint: identity.fingerprint,
		promise
	});
	try {
		return await promise;
	} finally {
		if (inFlight.get(key)?.promise === promise) {
			inFlight.delete(key);
		}
	}
}

async function execute(config, identity, producer) {
	const existing = await Store.read(config, identity);
	if (existing) {
		return Responses.fromRecord(existing, identity);
	}
	if (identity.retry) {
		return Responses.unknown(identity);
	}
	if (!Policy.shouldPersist(identity.action)) {
		return await producer();
	}
	const reservation = await Store.reserve(config, identity);
	if (!reservation.created) {
		return Responses.fromRecord(reservation.record, identity);
	}
	let result;
	try {
		result = await producer();
	} catch (error) {
		await Store.fail(config, identity, error).catch(() => {});
		throw error;
	}
	try {
		await Store.complete(config, identity, result);
		return result;
	} catch (error) {
		return Responses.persistenceFailure(identity, result, error);
	}
}

async function join(active, identity) {
	const matches = identity.retry
		? active.action === identity.action
		: active.fingerprint === identity.fingerprint;
	if (!matches) {
		return Responses.conflict(identity, active);
	}
	const result = await active.promise;
	return Responses.annotate(result, "inflight", identity);
}

function childMode() {
	return process.env.AWTSMOOS_ASYNC_CHILD === "1";
}

function resetForTests() {
	inFlight.clear();
}

module.exports = {
	childMode,
	execute,
	join,
	resetForTests,
	run
};
