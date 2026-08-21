// B"H
// Boruch Hashem
// Blessed is He

const { startRunProgress } = require("./main-run-progress.js");
const { completeRun, failRun } = require("./main-run-result.js");

/**
 * @file Holds one exact scheduler ownership record through execution and release.
 * @description
 * The Awtsmoos renews one request through lane, worker, result, and acknowledgement.
 * Awtsmoos.com never releases by a vague requester alone: the exact request key
 * must return the exact inflight vessel that began this execution.
 */
function createRequestRunner(dependencies) {
	return async function runRequest(
		lane,
		webSocket,
		raw,
		enqueuedAt,
		requesterKey,
		requestKey
	) {
		if (!requesterKey || !requestKey) {
			throw new Error("missing_exact_scheduler_ownership");
		}
		const data = dependencies.routedData(raw);
		const context = {
			data,
			payload: data.payload,
			lane,
			ws: webSocket,
			enqueuedAt,
			requesterKey,
			requestKey,
			startedAt: Date.now()
		};
		dependencies.streamEvent("action.started", context.payload, {
			lane,
			requestKey,
			queuedMs: Math.max(0, context.startedAt - enqueuedAt)
		});
		const progress = startRunProgress(dependencies, context);
		try {
			const result = await execute(data, webSocket, dependencies, progress);
			progress.stop();
			return completeRun(
				dependencies,
				context,
				result,
				progress.state.advisorySent
			);
		} catch (error) {
			progress.stop();
			return failRun(dependencies, context, error);
		} finally {
			dependencies.release(lane, requesterKey, requestKey);
		}
	};
}

async function execute(data, webSocket, dependencies, executionObserver) {
	const payload = data.payload;
	let result = await dependencies.dispatch(
		dependencies.Kind.normalize(payload),
		payload,
		webSocket,
		data,
		executionObserver
	);
	result = await dependencies.Continue.run({
		result,
		payload,
		ws: webSocket,
		data,
		dispatch: dependencies.dispatch,
		executionObserver,
		normalize: dependencies.Kind.normalize
	});
	return result;
}

module.exports = {
	createRequestRunner,
	execute
};
