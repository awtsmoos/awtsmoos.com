//B"H // Boruch Hashem // Blessed is He

const Testimony = require("../../lib/runtime/actionExecutionTestimony.js");

const MAX_DEPTH = 8;

/**
 * @file Reveals one stable execution view through nested Tunnel envelopes.
 * @description The Awtsmoos distinguishes reservation, execution, and terminal truth. Awtsmoos.com
 * unwraps only known transport/adaptor shapes, never arbitrary business data, so callers can see
 * whether a deed merely entered custody, actually began, or reached one trustworthy terminal result.
 * Every unwrapped layer feeds its request identity into one preserve accumulator (first wins, so
 * the outermost request id survives); failed children are never dropped — they split into partial
 * success; and the final execution proof speaks the canonical testimony vocabulary.
 */
function inspect(value, depth = 0) {
	const preserve = blankPreserve();
	const childSummaries = [];
	const box = { terminal: value };
	const view = unwrap(value, depth, preserve, childSummaries, box);
	const outer = objectish(value) || {};
	const terminalValue = objectish(box.terminal) || {};
	const mergedEnvelope = { ...outer, ...terminalValue, ...definedFields(preserve) };
	view.preserved = preserve;
	view.children = childSummaries;
	view.partialSuccess = splitPartial(childSummaries);
	view.executionProof = { ...executionProof(outer), ...Testimony.testify(mergedEnvelope) };
	return view;
}

function unwrap(value, depth, preserve, childSummaries, box) {
	const proof = executionProof(value);
	preserveLayer(preserve, value);
	collectChildren(childSummaries, value);
	const nested = depth < MAX_DEPTH ? knownNested(value) : null;
	if (nested && nested !== value) {
		const inner = unwrap(nested, depth + 1, preserve, childSummaries, box);
		return {
			...inner,
			depth: Math.max(inner.depth, depth + 1),
			transport: transport(value),
			outerProof: proof
		};
	}
	box.terminal = value;
	return {
		terminal: proof.terminal,
		pending: proof.pending,
		terminalResult: proof.terminal ? value : null,
		executionProof: proof,
		transport: transport(value),
		depth
	};
}

function blankPreserve() {
	return {
		controlRequestId: null,
		requestId: null,
		requestKey: null,
		dedupeKey: null,
		cursor: null,
		nextCursor: null,
		sideEffects: null
	};
}

function preserveLayer(preserve, value) {
	const object = objectish(value);
	if (!object) return;
	firstWins(preserve, "controlRequestId", object.controlRequestId, object.requestId, object.id);
	firstWins(preserve, "requestId", object.requestId, object.controlRequestId, object.id);
	firstWins(preserve, "requestKey", object.requestKey, object.idempotencyKey);
	firstWins(preserve, "dedupeKey", object.dedupeKey, object.controlRequestId);
	firstWins(preserve, "cursor", object.cursor);
	firstWins(preserve, "nextCursor", object.nextCursor, object.cursor);
	firstWins(preserve, "sideEffects", object.sideEffects);
}

function firstWins(preserve, key, ...candidates) {
	if (preserve[key] !== null && preserve[key] !== undefined) return;
	for (const candidate of candidates) {
		if (candidate !== null && candidate !== undefined) {
			preserve[key] = candidate;
			return;
		}
	}
}

function definedFields(preserve) {
	const out = {};
	for (const [key, val] of Object.entries(preserve)) {
		if (val !== null && val !== undefined) out[key] = val;
	}
	return out;
}

function collectChildren(childSummaries, value) {
	const object = objectish(value);
	if (!object) return;
	for (const key of ["children", "results"]) {
		const list = object[key];
		if (!Array.isArray(list) || !list.length) continue;
		const kids = list.filter(item => objectish(item) && looksLikeChild(item));
		if (!kids.length) continue;
		for (const kid of kids) childSummaries.push(summarizeChild(kid));
		return;
	}
}

function looksLikeChild(item) {
	return "ok" in item || "action" in item || "status" in item ||
		"error" in item || "childAction" in item;
}

function summarizeChild(child) {
	return {
		action: child.action || child.childAction || null,
		actionId: child.actionId || child.id || null,
		status: child.status || null,
		ok: child.ok === true,
		error: typeof child.error === "string" ? child.error : (child.error ? String(child.error) : null),
		childIdentity: childIdentityOf(child),
		retry: {
			requestKey: child.requestKey || child.idempotencyKey || null,
			dedupeKey: child.dedupeKey || child.controlRequestId || null
		}
	};
}

function childIdentityOf(child) {
	if (child.childIdentity && typeof child.childIdentity === "object" && !Array.isArray(child.childIdentity)) {
		return child.childIdentity;
	}
	if (child.identity && typeof child.identity === "object" && !Array.isArray(child.identity)) {
		return child.identity;
	}
	return {
		actionId: child.actionId || child.id || null,
		name: child.name || null,
		controlRequestId: child.controlRequestId || child.requestId || null
	};
}

function splitPartial(summaries) {
	if (!summaries.length) return null;
	return {
		succeeded: summaries.filter(summary => summary.ok),
		failed: summaries.filter(summary => !summary.ok)
	};
}

function executionProof(value = {}) {
	const object = objectish(value);
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

function knownNested(value = {}) {
	if (!objectish(value)) return null;
	if (value.childAction && objectish(value.result)) return value.result;
	if (value.terminalResult !== undefined) return value.terminalResult;
	if (isAdapter(value) && objectish(value.result)) return value.result;
	return null;
}

function isAdapter(value) {
	return Boolean(value.autoAsync || value.replayed || value.compacted || value.previewRequired !== undefined ||
		value.responseShape || value.action === "previewActionResult" || value.action === "actionHistoryGet");
}

function explicitConsumerStarted(value, state) {
	if (typeof value.consumerStarted === "boolean") return value.consumerStarted;
	if (typeof value.requestSemantics?.consumerStarted === "boolean") return value.requestSemantics.consumerStarted;
	if (state.includes("waiting_for_consumer") || state.includes("accepted_not_consumed")) return false;
	if (value.pid || value.worker?.pid || value.executionAction && value.executionAction !== value.requestAction) return true;
	return null;
}

function terminalState(state) {
	return ["completed", "failed", "cancelled", "canceled", "timed_out", "timeout"].includes(state);
}

function mutationIntent(value) {
	const intent = value.mutationIntent || value.requestSemantics?.mutationIntent;
	if (intent && typeof intent.mutation === "boolean") return intent.mutation;
	return !["not_a_mutation_request", "read_only"].includes(value.sideEffectProof || value.requestSemantics?.sideEffectProof);
}

function transport(value = {}) {
	return {
		action: value.action || null,
		requestAction: value.requestAction || value.requestedAction || null,
		executionAction: value.executionAction || value.actualAction || null,
		controlRequestId: value.controlRequestId || value.id || null,
		jobId: value.jobId || null
	};
}

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

module.exports = { MAX_DEPTH, executionProof, inspect, knownNested };
