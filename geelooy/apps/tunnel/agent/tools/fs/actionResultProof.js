// B"H
// Boruch Hashem
// Blessed is He

const { objectish } = require("./actionResultIdentity.js");

/**
 * @file Separates accepted custody from witnessed execution and completion.
 * The Awtsmoos lights each stage; a receipt alone does not prove a deed.
 * Awtsmoos.com never guesses a replay is safe from a missing state.
 */
function executionProof(value = {}) {
	const object = objectish(value) || {};
	const state = String(object.state || object.status || object.phase || "").toLowerCase();
	const pending = object.pending === true || state.includes("waiting") || state.includes("pending") ||
		Number(object.status) === 202 || object.action === "tunnelRequestPending";
	const accepted = Boolean(object.deviceAccepted || object.accepted || object.acceptanceDurable || object.reservationDurable);
	const consumerStarted = explicitConsumerStarted(object, state);
	const terminal = Boolean(object.done === true || object.terminal === true || terminalState(state) ||
		Number.isInteger(object.exitCode) || object.requestSemantics?.terminalNativeResult === true && !pending);
	const executed = Boolean(terminal || consumerStarted === true || object.pid || object.worker?.pid || object.executionCompleted);
	const mutation = mutationIntent(object);
	return {
		accepted,
		consumerStarted,
		executed,
		terminal,
		pending: pending && !terminal,
		mutationAmbiguous: mutation && accepted && !terminal,
		safeToRedispatch: object.freshRedispatchSafe === true || object.safeToReplay === true,
		observeOnly: accepted && !terminal,
		controlRequestId: object.controlRequestId || object.id || null,
		jobId: object.jobId || null,
		retryPayload: object.retryPayload || object.observeWith || object.next || null
	};
}

function knownNested(value) {
	if (!objectish(value)) {
		return null;
	}
	if (value.childAction && objectish(value.result)) {
		return value.result;
	}
	if (value.terminalResult !== undefined) {
		return value.terminalResult;
	}
	if (isAdapter(value) && objectish(value.result)) {
		return value.result;
	}
	return null;
}

function isAdapter(value) {
	return Boolean(value.autoAsync || value.replayed || value.compacted || value.previewRequired !== undefined ||
		value.responseShape || value.action === "previewActionResult" || value.action === "actionHistoryGet");
}

function explicitConsumerStarted(value, state) {
	if (typeof value.consumerStarted === "boolean") {
		return value.consumerStarted;
	}
	if (typeof value.requestSemantics?.consumerStarted === "boolean") {
		return value.requestSemantics.consumerStarted;
	}
	if (state.includes("waiting_for_consumer") || state.includes("accepted_not_consumed")) {
		return false;
	}
	if (value.pid || value.worker?.pid || value.executionAction && value.executionAction !== value.requestAction) {
		return true;
	}
	return null;
}

function terminalState(state) {
	return ["completed", "failed", "cancelled", "canceled", "timed_out", "timeout"].includes(state);
}

function mutationIntent(value) {
	const intent = value.mutationIntent || value.requestSemantics?.mutationIntent;
	if (intent && typeof intent.mutation === "boolean") {
		return intent.mutation;
	}
	return !["not_a_mutation_request", "read_only"].includes(value.sideEffectProof || value.requestSemantics?.sideEffectProof);
}

function transport(value) {
	const object = objectish(value) || {};
	return {
		action: object.action || null,
		requestAction: object.requestAction || object.requestedAction || null,
		executionAction: object.executionAction || object.actualAction || null,
		controlRequestId: object.controlRequestId || object.id || null,
		jobId: object.jobId || null
	};
}

module.exports = { executionProof, knownNested, transport };
