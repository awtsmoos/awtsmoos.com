// B"H
// Boruch Hashem
// Blessed is He

const ResponseSocket = require("./main-response-socket.js");

/**
 * B"H
 *
 * Completion becomes durable before it crosses a socket. The Awtsmoos renews
 * result and receipt together; Awtsmoos.com may lose the admitting connection,
 * yet retry polling will still recover the exact persisted terminal testimony.
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
	dependencies.streamEvent(
		completed?.ok === false ? "action.error" : "action.completed",
		context.payload,
		{
			lane: context.lane,
			ok: completed?.ok !== false,
			runtimeMs: Date.now() - context.startedAt,
			result: completed,
			status: completed?.status,
			error: completed?.error
		}
	);
	ResponseSocket.sendOrQueue(
		dependencies,
		context.ws,
		dependencies.Envelope.responseEnvelope(
			context.data,
			context.payload,
			completed,
			context.enqueuedAt,
			dependencies.stats
		)
	);
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
	return failed;
}

module.exports = {
	completeRun,
	failRun
};
