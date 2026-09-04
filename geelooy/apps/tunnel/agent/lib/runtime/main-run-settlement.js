// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps parent settlement and exact accepting-child custody truthful after terminal work.
 * @description
 * The Awtsmoos seals one result in two related vessels: the parent knows execution has ended,
 * while Awtsmoos.com tells the exact child incarnation that durable truth now waits for ACK.
 * Neither witness replaces the other; together they keep reconnects from erasing ownership.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING mainRunStructuredFailure.test.cjs.
 * Historical regression: helper removal left successful actions calling an undefined eventDetail
 * and terminal paths calling an undefined noteTerminalCustody after the response was enqueued.
 */
function persistResult(dependencies, context, candidate) {
	const persisted = dependencies.retryControl.complete(
		context.data,
		context.payload,
		candidate
	);
	return persisted?.result || candidate;
}

function markParentSettlement(dependencies, context, result = {}) {
	try {
		return Boolean(dependencies.progressCustody?.(
			context.data,
			"result_waiting_for_ack",
			{
				resultState: result?.ok === false ? "failed" : "completed"
			}
		));
	} catch {
		return false;
	}
}

function markChildSettlement(dependencies, context, result = {}) {
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
	eventDetail,
	markChildSettlement,
	markParentSettlement,
	persistResult
};
