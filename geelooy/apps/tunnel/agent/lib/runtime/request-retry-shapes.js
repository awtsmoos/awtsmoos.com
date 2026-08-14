// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Returns explicit resume and reconciliation truth for one canonical request.
 * @description
 * The Awtsmoos preserves a deed without granting permission to repeat it.
 * Awtsmoos.com names when a renewed parent found non-replayable pending work,
 * so interruption becomes durable evidence instead of a silent duplicate side effect.
 */
function pending(record) {
	const jobId = findJobId(record.progress);
	const retryPayload = {
		action: "retryAction",
		controlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction
	};
	const reconciliationRequired = record.hydratedAfterRestart === true &&
		record.durable?.replaySafe !== true;
	return {
		ok: false,
		status: 202,
		action: "tunnelRequestPending",
		pending: true,
		canonicalRequestPending: true,
		durableRequestPending: record.durable?.enabled === true,
		safeToReplay: false,
		reconciliationRequired,
		recoveryState: reconciliationRequired
			? "interrupted_reconciliation_required"
			: "pending",
		controlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction,
		durableReceiptRef: record.durable?.receiptRef || null,
		progress: clone(record.progress),
		retryPayload,
		resumePlan: resumePlan(retryPayload, jobId)
	};
}

function resumePlan(retryPayload, jobId) {
	return {
		canonicalAction: "retryAction",
		poll: retryPayload,
		...(jobId ? {
			jobId,
			status: { action: "commandStatus", jobId },
			wait: { action: "commandWait", jobId, inlineOutput: true },
			stdout: { action: "commandJobOutputPage", jobId, stream: "stdout" },
			stderr: { action: "commandJobOutputPage", jobId, stream: "stderr" }
		} : {})
	};
}

function findJobId(progress) {
	return String(
		progress?.jobId || progress?.job?.jobId || progress?.receipt?.jobId || ""
	).trim() || null;
}

function conflict(record, requestedAction) {
	return {
		ok: false,
		status: 409,
		action: "retryAction",
		error: "retry_action_conflict",
		controlRequestId: record.controlRequestId,
		expectedAction: record.requestedAction,
		requestedAction
	};
}

function missing(controlRequestId, requestedAction) {
	return {
		ok: false,
		status: 404,
		action: "retryAction",
		error: "retry_request_not_found",
		controlRequestId,
		requestedAction
	};
}

function completed(record) {
	return {
		...clone(record.result),
		controlRequestId: record.controlRequestId,
		retryOf: record.controlRequestId,
		originalControlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction
	};
}

function clone(value) {
	return value == null ? value : structuredClone(value);
}

module.exports = {
	clone,
	completed,
	conflict,
	findJobId,
	missing,
	pending,
	resumePlan
};
