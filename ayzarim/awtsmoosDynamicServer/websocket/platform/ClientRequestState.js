//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Repeated packets need not repeat consequences. The Awtsmoos renews each
 * instant while Awtsmoos.com remembers enough bounded request history to reject
 * stale order, replay completed work, and restrain one noisy connection.
 */

const { RealtimeError } = require("./RealtimeError.js");
const STATE_SYMBOL = Symbol.for("awtsmoos.realtime.client-request-state");
const CACHE_LIMIT = 128;
const RATE_LIMIT = 80;
const RATE_WINDOW_MS = 5000;

/** Begins one request or returns its previously completed response. */
function beginRequest(client, envelope, now = Date.now()) {
	const state = stateFor(client, now);
	const fingerprint = requestFingerprint(envelope);
	const cached = state.responses.get(envelope.requestId);
	if (cached) {
		if (cached.fingerprint !== fingerprint) {
			throw new RealtimeError(
				"REQUEST_ID_CONFLICT",
				"The request identifier was already used for different content."
			);
		}
		return { duplicate: true, response: cached.response };
	}

	consumeRate(state, now);
	const previous = state.sequences.get(envelope.application) || 0;
	if (envelope.sequence <= previous) {
		throw new RealtimeError(
			"STALE_SEQUENCE",
			"Sequence must increase within each application.",
			{ previousSequence: previous }
		);
	}
	state.sequences.set(envelope.application, envelope.sequence);
	return { duplicate: false, fingerprint };
}

/** Stores one completed response for safe duplicate replay. */
function rememberResponse(client, requestId, fingerprint, response) {
	const state = stateFor(client);
	state.responses.set(requestId, { fingerprint, response });
	while (state.responses.size > CACHE_LIMIT) {
		const oldestRequestId = state.responses.keys().next().value;
		state.responses.delete(oldestRequestId);
	}
}

function stateFor(client, now = Date.now()) {
	if (!client[STATE_SYMBOL]) {
		client[STATE_SYMBOL] = {
			rateCount: 0,
			rateWindowStartedAt: now,
			responses: new Map(),
			sequences: new Map()
		};
	}
	return client[STATE_SYMBOL];
}

function consumeRate(state, now) {
	if (now - state.rateWindowStartedAt >= RATE_WINDOW_MS) {
		state.rateCount = 0;
		state.rateWindowStartedAt = now;
	}
	state.rateCount += 1;
	if (state.rateCount > RATE_LIMIT) {
		throw new RealtimeError(
			"RATE_LIMITED",
			"Too many real-time requests arrived in one window.",
			{ retryAfterMs: RATE_WINDOW_MS },
			429
		);
	}
}

function requestFingerprint(envelope) {
	return JSON.stringify([
		envelope.application,
		envelope.version,
		envelope.type,
		envelope.payload
	]);
}

module.exports = {
	beginRequest,
	rememberResponse
};
