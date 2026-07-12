// B"H

const { boundedTimeout, cleanRelayPayload, safeRelayWaitMs } = require("./normalizers.js");
const { requestExpectation, sameExpectation } = require("./expectation.js");
const { validateTunnelResponse } = require("./validation.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");

/**
 * B"H — A false messenger is quarantined, not crowned. The true request stays
 * alive until its matching response arrives, even when many conversations share
 * one tunnel and their replies return in a storm of reversed order.
 */
function handleTunnelResponse(context, data = {}) {
	State.ensureStores(context);
	const id = String(data.id || data.controlRequestId || "");
	const record = id ? context.pendingTunnelRequests.get(id) : null;
	if (!record) {
		State.quarantine(context, { reason: "unsolicited_response", id, data });
		return false;
	}
	const validation = validateTunnelResponse(record.expected, data);
	if (!validation.ok) {
		record.mismatchCount += 1;
		State.quarantine(context, {
			reason: "correlation_mismatch",
			id,
			mismatchCount: record.mismatchCount,
			response: validation.response
		});
		return false;
	}
	return Lifecycle.finishPending(context, id, record, data);
}

function completedResult(context, id, expected) {
	const completed = State.completed(context, id);
	if (!completed) return null;
	const validation = validateTunnelResponse(expected, completed.data);
	return validation.ok ? completed.data : Envelopes.conflictEnvelope(expected, completed.expected);
}

function existingResult(context, id, expected, waitMs) {
	const existing = context.pendingTunnelRequests.get(id);
	if (!existing) return null;
	return sameExpectation(expected, existing.expected)
		? Lifecycle.attachWaiter(existing, waitMs)
		: Promise.resolve(Envelopes.conflictEnvelope(expected, existing.expected));
}

function sendTunnelRequest(context, name, payload, timeout) {
	State.ensureStores(context);
	State.cleanup(context);
	const cleaned = cleanRelayPayload(payload || {});
	const tunnel = context.tunnels.get(name);
	if (!tunnel) return Promise.resolve(Envelopes.disconnectedEnvelope(name, cleaned.action));
	const id = cleaned.controlRequestId || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
	const timeoutMs = boundedTimeout(timeout);
	const waitMs = safeRelayWaitMs(cleaned.relayWaitMs || cleaned.httpSafeWaitMs);
	const expected = requestExpectation(id, name, { ...cleaned, controlRequestId: id }, timeoutMs);
	const completed = completedResult(context, id, expected);
	if (completed) return Promise.resolve(completed);
	const existing = existingResult(context, id, expected, waitMs);
	if (existing) return existing;
	const record = Lifecycle.createRecord(context, id, expected, timeoutMs);
	const waiting = Lifecycle.attachWaiter(record, waitMs);
	try {
		tunnel.send({ type: "TUNNEL_REQUEST", id, payload: { ...cleaned, controlRequestId: id } });
	} catch (error) {
		Lifecycle.rejectPending(context, id, record, error);
	}
	return waiting;
}

module.exports = { handleTunnelResponse, sendTunnelRequest, timeoutEnvelope: Envelopes.timeoutEnvelope };
