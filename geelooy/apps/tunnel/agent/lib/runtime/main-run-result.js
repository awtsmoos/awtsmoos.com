// B"H
// Boruch Hashem
// Blessed is He

const ResponseSocket = require("./main-response-socket.js");

/**
 * @file Persists terminal action truth before delivery, then advances exact child custody to ACK wait.
 * @description
 * The Awtsmoos seals result and receipt before the socket may scatter or sever the line;
 * Awtsmoos.com tells the accepting child that terminal truth now waits for server acknowledgement in time.
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
	const completed = persistResult(dependencies, context, candidate);
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
	const failed = persistResult(dependencies, context, candidate);
	dependencies.streamEvent("action.error", context.payload, eventDetail(context, failed));
	ResponseSocket.sendOrQueue(dependencies, context.ws, {
		type: "TUNNEL_RESPONSE",
		id: context.data.id,
		...dependencies.Correlation.fields(context.payload),
		...failed
	});
	noteTerminalCustody(dependencies, context, failed);
	return failed;
}

/** Persists terminal retry testimony before any transport-side custody phase changes. */
function persistResult(dependencies, context, candidate) {
	const persisted = dependencies.retryControl.complete(
		context.data,
		context.payload,
		candidate
	);
	return persisted?.result || candidate;
}

/** Advances only the child that accepted this exact request into terminal ACK waiting. */
function noteTerminalCustody(dependencies, context, result) {
	return dependencies.noteCustodyProgress?.(
		String(context.data?.id || ""),
		context.childIncarnationId,
		{
			phase: "result_waiting_for_ack",
			resultState: result?.ok === false ? "failed" : "completed"
		}
	) === true;
}

function eventDetail(context, result) {
	return {
		lane: context.lane,
		ok: result?.ok !== false,
		runtimeMs: Date.now() - context.startedAt,
		result,
		status: result?.status,
		error: result?.error
	};
}

module.exports = {
	completeRun,
	eventDetail,
	failRun,
	noteTerminalCustody,
	persistResult
};
