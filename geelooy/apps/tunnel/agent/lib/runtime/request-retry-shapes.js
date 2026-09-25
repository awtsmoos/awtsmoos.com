// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Returns explicit resume and reconciliation truth for one canonical request.
 * @description
 * The Awtsmoos preserves a deed without granting permission to repeat it.
 * Awtsmoos.com names when a renewed parent found non-replayable pending work,
 * so interruption becomes durable evidence instead of a silent duplicate side effect.
 * Every shape carries an explicit testimony block in one canonical vocabulary:
 * accepted_not_executed, interrupted_ambiguous, fingerprint_conflict, unknown_request,
 * or replayed_terminal — so retry callers never infer execution state from ad-hoc flags.
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
	const mutation = mutationOf(record);
	const testimonyState = reconciliationRequired ? "interrupted_ambiguous" : "accepted_not_executed";
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
		testimony: {
			state: testimonyState,
			testimonyState,
			accepted: true,
			executed: false,
			terminal: false,
			observeOnly: true,
			mutationPossible: mutation.possible,
			mutationAmbiguous: mutation.ambiguous,
			safeToReplay: false,
			safeToRedispatch: false,
			sideEffects: sideEffectsOf(record),
			retry: {
				requestKey: stringOf(record.requestKey),
				dedupeKey: stringOf(record.controlRequestId),
				attempt: null
			}
		},
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
		requestedAction,
		testimony: {
			state: "fingerprint_conflict",
			testimonyState: "fingerprint_conflict",
			accepted: true,
			executed: false,
			terminal: true,
			observeOnly: true,
			mutationPossible: mutationOf(record).possible,
			mutationAmbiguous: false,
			safeToReplay: false,
			safeToRedispatch: false,
			sideEffects: sideEffectsOf(record),
			retry: {
				requestKey: stringOf(record.requestKey),
				dedupeKey: stringOf(record.controlRequestId),
				attempt: null
			}
		}
	};
}

function missing(controlRequestId, requestedAction) {
	return {
		ok: false,
		status: 404,
		action: "retryAction",
		error: "retry_request_not_found",
		controlRequestId,
		requestedAction,
		testimony: {
			state: "unknown_request",
			testimonyState: "unknown_request",
			accepted: false,
			executed: false,
			terminal: true,
			observeOnly: false,
			mutationPossible: false,
			mutationAmbiguous: false,
			safeToReplay: false,
			safeToRedispatch: false,
			sideEffects: [],
			retry: {
				requestKey: "",
				dedupeKey: stringOf(controlRequestId),
				attempt: null
			}
		}
	};
}

function completed(record) {
	return {
		...clone(record.result),
		controlRequestId: record.controlRequestId,
		retryOf: record.controlRequestId,
		originalControlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction,
		testimony: {
			state: "replayed_terminal",
			testimonyState: "replayed_terminal",
			accepted: true,
			executed: true,
			terminal: true,
			observeOnly: false,
			mutationPossible: mutationOf(record).possible,
			mutationAmbiguous: false,
			safeToReplay: true,
			safeToRedispatch: false,
			sideEffects: sideEffectsOf(record.result),
			retry: {
				requestKey: stringOf(record.requestKey),
				dedupeKey: stringOf(record.controlRequestId),
				attempt: null
			}
		}
	};
}

function mutationOf(record = {}) {
	const intent = record.mutationIntent && typeof record.mutationIntent === "object" ? record.mutationIntent : {};
	const possible = intent.mutation === true || record.mutation === true || record.mutates === true;
	return {
		possible,
		ambiguous: possible && record.durable?.replaySafe !== true
	};
}

function sideEffectsOf(record) {
	if (!record || typeof record !== "object") return [];
	if (Array.isArray(record.sideEffects)) return record.sideEffects.filter(item => item && typeof item === "object");
	if (record.sideEffect && typeof record.sideEffect === "object") return [record.sideEffect];
	return [];
}

function stringOf(value) {
	if (typeof value === "string") return value;
	if (value === undefined || value === null) return "";
	return String(value);
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
	mutationOf,
	pending,
	resumePlan
};
