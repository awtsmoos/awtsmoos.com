// B"H
// Boruch Hashem
// Blessed is He

const ResponseSocket = require("./main-response-socket.js");

/**
 * @file Persists terminal result before socket settlement and marks custody awaiting ACK.
 * @description
 * The Awtsmoos renews result and receipt together; Awtsmoos.com keeps terminal metadata
 * durable before transport and tells the accepting child that execution is finished but
 * settlement is not. Only the later response ACK may remove durable mailbox custody.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Forbidden simplification: deleting custody at process exit or result persistence.
 * Regression: connectionCustodyProgressIpc.test.cjs. Live proof: result_waiting_for_ack
 * must remain until server settlement ACK and then disappear exactly once.
 */
function completeRun(dependencies, context, result, advisoryOvertime) {
	if (result && result.ok !== false) {
		dependencies.state.lastSuccessfulActionAt = Date.now();
	}
	const candidate = {
		...result,
		lane: context.lane,
		longLivedConnection: true,
		advisoryOvertime
	};
	const persisted = dependencies.retryControl.complete(
		context.data,
		context.payload,
		candidate
	);
	const completed = persisted?.result || candidate;
	markSettlementCustody(dependencies, context, completed);
	dependencies.streamEvent(
		completed?.ok === false ? "action.error" : "action.completed",
		context.payload,
		eventDetail(context, completed)
	);
	const envelope = dependencies.Envelope.responseEnvelope(
		context.data,
		context.payload,
		completed,
		context.enqueuedAt,
		dependencies.stats
	);
	ResponseSocket.sendOrQueue(dependencies, context.ws, envelope);
	noteTerminalCustody(dependencies, context, completed);
	return completed;
}

function failRun(dependencies, context, error) {
	const candidate = {
		ok: false,
		status: 500,
		error: error.message,
		stack: error.stack,
		lane: context.lane,
		longLivedConnection: true
	};
	const persisted = dependencies.retryControl.complete(
		context.data,
		context.payload,
		candidate
	);
	const failed = persisted?.result || candidate;
	markSettlementCustody(dependencies, context, failed);
	dependencies.streamEvent("action.error", context.payload, {
		...failed,
		runtimeMs: Date.now() - context.startedAt
	});
	ResponseSocket.sendOrQueue(dependencies, context.ws, {
		type: "TUNNEL_RESPONSE",
		id: context.data.id,
		...dependencies.Correlation.fields(context.payload),
		...failed
	});
	noteTerminalCustody(dependencies, context, failed);
	return failed;
}

function markSettlementCustody(dependencies, context, result = {}) {
	try {
		return Boolean(dependencies.progressCustody?.(
			context.data,
			"result_waiting_for_ack",
			{ resultState: result?.ok === false ? "failed" : "completed" }
		));
	} catch {
		return false;
	}
}

module.exports = { completeRun, failRun };
