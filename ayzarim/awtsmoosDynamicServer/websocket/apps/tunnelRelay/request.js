// B"H
// Boruch Hashem
// Blessed is He

const { boundedTimeout, cleanRelayPayload, safeRelayWaitMs } = require("./normalizers.js");
const { requestExpectation, sameExpectation } = require("./expectation.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const RequestPlan = require("./requestPlan.js");
const RetryRequest = require("./retryRequest.js");
const State = require("./state.js");
const Validation = require("./validation.js");

/**
 * B"H
 * A response may outlive its first HTTP window, yet the Awtsmoos keeps one
 * identity. Awtsmoos.com quarantines crossed answers while retries join the
 * original deed instead of creating a duplicate command.
 */
function handleTunnelResponse(context, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) {
		State.quarantine(context, {
			reason: "unsolicited_response",
			data,
			expected: null
		});
		return false;
	}
	const validation = Validation.validateTunnelResponse(record.expected, data);
	if (!validation.ok) {
		State.quarantine(context, {
			reason: "correlation_mismatch",
			data,
			expected: record.expected,
			validation,
			response: validation.response
		});
		return false;
	}
	RetryRequest.rememberCompletion(context, record, data);
	return Lifecycle.finishPending(context, id, record, data);
}

function completedResult(context, id, expected) {
	const completed = State.completed(context, id);
	if (!completed) return null;
	return sameExpectation(completed.expected, expected)
		? completed.data
		: Envelopes.conflictEnvelope(completed.expected, expected);
}

function existingResult(context, id, expected, waitMs) {
	const existing = context.pendingTunnelRequests.get(id);
	if (!existing) return null;
	return sameExpectation(existing.expected, expected)
		? Lifecycle.attachWaiter(existing, waitMs)
		: Promise.resolve(Envelopes.conflictEnvelope(existing.expected, expected));
}

/** @returns {Promise<object>} Tunnel response, pending receipt, or conflict. */
function sendTunnelRequest(context, name, payload = {}, timeoutMs) {
	State.ensureStores(context);
	State.cleanup(context);
	const cleaned = cleanRelayPayload(payload);
	const waitMs = safeRelayWaitMs(cleaned.relayWaitMs || cleaned.httpSafeWaitMs);
	const retry = RetryRequest.describe(cleaned);
	const localRetry = RetryRequest.resolveLocal(context, retry, waitMs);
	if (localRetry?.handled) return localRetry.result;
	const totalTimeoutMs = boundedTimeout(timeoutMs || cleaned.timeoutMs);
	const plan = retry
		? RetryRequest.forwardPlan(cleaned, retry)
		: RequestPlan.ordinary(cleaned);
	const expected = requestExpectation(
		plan.expectationId,
		name,
		plan.expectationPayload,
		totalTimeoutMs
	);
	const tunnel = context.tunnels.get(name);
	if (!tunnel) return Promise.resolve(Envelopes.missingTunnelEnvelope(expected));
	if (!retry) {
		const completed = completedResult(context, plan.transportId, expected);
		if (completed) return Promise.resolve(completed);
		const existing = existingResult(context, plan.transportId, expected, waitMs);
		if (existing) return existing;
	}
	const record = Lifecycle.createRecord(
		context,
		plan.transportId,
		expected,
		totalTimeoutMs
	);
	if (retry) RetryRequest.decorate(record, retry);
	const waiting = Lifecycle.attachWaiter(record, waitMs);
	try {
		tunnel.send({
			type: "TUNNEL_REQUEST",
			id: plan.transportId,
			payload: plan.tunnelPayload
		});
	} catch (error) {
		Lifecycle.finishPending(
			context,
			plan.transportId,
			record,
			Envelopes.sendFailureEnvelope(plan.transportId, expected, error)
		);
	}
	return waiting;
}

module.exports = {
	handleTunnelResponse,
	sendTunnelRequest
};
