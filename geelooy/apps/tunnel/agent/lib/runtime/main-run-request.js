// B"H
// Boruch Hashem
// Blessed is He

const { startRunProgress } = require("./main-run-progress.js");
const { completeRun, failRun } = require("./main-run-result.js");

/**
 * B"H
 *
 * One request owns one fair lane slot from dispatch through final response. The
 * Awtsmoos renews every deed; Awtsmoos.com delegates progress and result shaping
 * while always releasing the exact requester's capacity in a final boundary.
 */
function createRequestRunner(dependencies) {
	return async function runRequest(
		lane,
		ws,
		raw,
		enqueuedAt,
		requesterKey = "anonymous"
	) {
		const data = dependencies.routedData(raw);
		const context = {
			data,
			payload: data.payload,
			lane,
			ws,
			enqueuedAt,
			startedAt: Date.now()
		};
		dependencies.streamEvent("action.started", context.payload, {
			lane,
			queuedMs: Math.max(0, context.startedAt - enqueuedAt)
		});
		const progress = startRunProgress(dependencies, context);
		try {
			const result = await execute(data, ws, dependencies);
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

async function execute(data, ws, dependencies) {
	const payload = data.payload;
	let result = await dependencies.dispatch(
		dependencies.Kind.normalize(payload),
		payload,
		ws,
		data
	);
	result = await dependencies.Continue.run({
		result,
		payload,
		ws,
		data,
		dispatch: dependencies.dispatch,
		normalize: dependencies.Kind.normalize
	});
	return result;
}

module.exports = {
	createRequestRunner,
	execute
};
