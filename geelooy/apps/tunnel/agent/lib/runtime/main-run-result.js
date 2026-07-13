// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Completion and failure cross one correlation boundary. The Awtsmoos renews
 * result and witness; Awtsmoos.com records a terminal retry state, emits one
 * stream event, and sends one response without owning execution or scheduling.
 */
function completeRun(dependencies, context, result, advisoryOvertime) {
	if (result && result.ok !== false) {
		dependencies.state.lastSuccessfulActionAt = Date.now();
	}
	const completed = {
		...result,
		lane: context.lane,
		longLivedConnection: true,
		advisoryOvertime
	};
	dependencies.retryControl.complete(
		context.data,
		context.payload,
		completed
	);
	dependencies.streamEvent(
		result?.ok === false ? "action.error" : "action.completed",
		context.payload,
		{
			lane: context.lane,
			ok: result?.ok !== false,
			runtimeMs: Date.now() - context.startedAt,
			result,
			status: result?.status,
			error: result?.error
		}
	);
	dependencies.Send.safeSend(
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
	const failed = {
		ok: false,
		status: 500,
		error: error.message,
		stack: error.stack,
		lane: context.lane,
		longLivedConnection: true
	};
	dependencies.retryControl.complete(
		context.data,
		context.payload,
		failed
	);
	dependencies.streamEvent("action.error", context.payload, {
		...failed,
		runtimeMs: Date.now() - context.startedAt
	});
	dependencies.Send.safeSend(context.ws, {
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
