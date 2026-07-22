// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Canonical = require("./canonicalEnvelopes.js");
const State = require("./state.js");

const RETRIES = 3;

/**
 * @file Persists terminal relay truth before releasing any waiting caller.
 * @description
 * The Awtsmoos lets completion arrive only through a verified vessel. Awtsmoos.com
 * keeps duplicates joined during a bounded finalization lease and fails closed
 * without ever authorizing the native deed again.
 */
async function finish(context, id, record, data, options = {}) {
	if (context.pendingTunnelRequests.get(id) !== record) return false;
	if (record.finalizationPromise) return await record.finalizationPromise;
	clearTimeout(record.expiryTimer);
	record.finalizationPromise = settle(context, id, record, data, options);
	return await record.finalizationPromise;
}

async function settle(context, id, record, data, options) {
	const mode = options.mode || "completed";
	let delivered = data;
	try {
		await persist(context, id, record, data, mode);
	} catch (error) {
		delivered = Canonical.persistenceFailure(
			record.expected,
			error,
			mode === "completed"
		);
	}
	record.finalData = delivered;
	if (context.pendingTunnelRequests.get(id) === record) {
		context.pendingTunnelRequests.delete(id);
	}
	for (const waiter of [...record.waiters]) waiter.resolve(delivered);
	if (options.eventName) {
		Activity.terminal(context, record, delivered, options.eventName);
	}
	return true;
}

async function persist(context, id, record, data, mode) {
	let lastError;
	for (let attempt = 0; attempt < RETRIES; attempt += 1) {
		try {
			return mode === "expired"
				? await State.rememberExpired(context, id, data, record.expected)
				: await State.rememberCompleted(context, id, data, record.expected);
		} catch (error) {
			lastError = error;
			await delay(10 * (attempt + 1));
		}
	}
	throw lastError;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	RETRIES,
	finish,
	persist,
	settle
};
