// B"H
// Boruch Hashem
// Blessed is He

const ErrorFields = require("./main-run-error-fields.js");
const ResponseSocket = require("./main-response-socket.js");
const Settlement = require("./main-run-settlement.js");

/**
 * @file Persists terminal result before transport and preserves both parent and child custody.
 * @description
 * The Awtsmoos renews result and receipt together; Awtsmoos.com keeps terminal metadata
 * durable before transport, marks parent settlement, then advances the exact accepting child
 * into ACK waiting only after the response enters its durable delivery vessel.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING mainRunStructuredFailure.test.cjs.
 * Parent settlement and child-incarnation settlement are distinct witnesses. Failure metadata
 * must also retain its bounded filesystem testimony through the final response envelope.
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
	const completed = Settlement.persistResult(dependencies, context, candidate);
	Settlement.markParentSettlement(dependencies, context, completed);
	dependencies.streamEvent(
		completed?.ok === false ? "action.error" : "action.completed",
		context.payload,
		Settlement.eventDetail(context, completed)
	);
	const envelope = dependencies.Envelope.responseEnvelope(
		context.data,
		context.payload,
		completed,
		context.enqueuedAt,
		dependencies.stats
	);
	ResponseSocket.sendOrQueue(dependencies, context.ws, envelope);
	Settlement.markChildSettlement(dependencies, context, completed);
	return completed;
}

function failRun(dependencies, context, error) {
	const candidate = {
		ok: false,
		status: 500,
		...ErrorFields.failureFields(error),
		lane: context.lane,
		longLivedConnection: true
	};
	const failed = Settlement.persistResult(dependencies, context, candidate);
	Settlement.markParentSettlement(dependencies, context, failed);
	dependencies.streamEvent(
		"action.error",
		context.payload,
		Settlement.eventDetail(context, failed)
	);
	ResponseSocket.sendOrQueue(dependencies, context.ws, {
		type: "TUNNEL_RESPONSE",
		id: context.data.id,
		...dependencies.Correlation.fields(context.payload),
		...failed
	});
	Settlement.markChildSettlement(dependencies, context, failed);
	return failed;
}

module.exports = {
	completeRun,
	failRun
};
