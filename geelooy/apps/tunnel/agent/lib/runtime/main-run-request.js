// B"H
// Boruch Hashem
// Blessed is He

const { startRunProgress } = require("./main-run-progress.js");
const { completeRun, failRun } = require("./main-run-result.js");

/**
 * @file Holds one fair lane slot while execution evidence follows real consumers.
 * @description
 * The Awtsmoos renews one request through lane, handler, worker, and result.
 * Awtsmoos.com passes a parent-only observer beside every internal dispatch so
 * continuation work cannot become an invisible second execution inside one request.
 */
function createRequestRunner(dependencies) {
	return async function runRequest(
		lane,
		webSocket,
		raw,
		enqueuedAt,
		requesterKey = "anonymous"
	) {
		const data = dependencies.routedData(raw);
		const context = {
			data,
			payload: data.payload,
			lane,
			ws: webSocket,
			enqueuedAt,
			startedAt: Date.now()
		};
		dependencies.streamEvent("action.started", context.payload, {
			lane,
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
			dependencies.release(lane, requesterKey);
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
