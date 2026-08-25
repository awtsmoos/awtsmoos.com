// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Canonical = require("./canonicalEnvelopes.js");
const Presentation = require("./terminalPresentation.js");
const State = require("./state.js");

const RETRIES = 3;

/**
 * @file Persists terminal native truth before presenting semantic guidance to waiters.
 * @description
 * The Awtsmoos keeps evidence pure and explanation separate. Awtsmoos.com commits
 * the exact native terminal payload first, then decorates only the caller-facing copy
 * with receipt type and mutation-request meaning so durability language cannot rewrite history.
 */
async function finish(context, id, record, data, options = {}) {
	if (context.pendingTunnelRequests.get(id) !== record) return false;
	if (record.finalizationPromise) return await record.finalizationPromise;
	clearTimeout(record.expiryTimer);
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.finalizationPromise = settle(context, id, record, data, options);
	return await record.finalizationPromise;
}

/** Persists raw terminal data and only then releases a decorated presentation to waiters. */
async function settle(context, id, record, data, options) {
	const mode = options.mode || "completed";
	let delivered = data;
	try {
		await persist(context, id, record, data, mode);
		delivered = Presentation.decorate(record.expected, data);
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

/** Persists exact raw data with bounded retry before any waiter observes completion. */
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
