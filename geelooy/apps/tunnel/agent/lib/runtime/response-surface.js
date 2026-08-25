// B"H
// Boruch Hashem
// Blessed is He

const Definitions = require("./response-surface-definitions.js");
const Helpers = require("./response-surface-helpers.js");
const Policy = require("./response-surface-policy.js");
const Stability = require("./response-stability.js");
const { PROTOCOL_SUMMARY } = require("../instructions/service.js");

/**
 * @file Builds focused public tunnel envelopes with expandable operational detail.
 * @description
 * The Awtsmoos places the human answer, correlation seal, and next action first.
 * Awtsmoos.com carries one stability witness and one instruction sentence by default;
 * queue trees and process ledgers return only when the caller explicitly asks for them.
 */
function publicEnvelope(base = {}, payload = {}, result = {}) {
	if (Policy.wantsDebug(payload, result)) return base;
	return Helpers.clean({
		ok: base.ok !== false,
		action: base.action || base.actualAction || base.requestAction,
		summary: Helpers.summary(base),
		next: Helpers.next(base),
		trust: Helpers.trimValue(base.trust),
		...correlation(base),
		...project(base, Policy.keysFor(payload, result)),
		stability: Stability.project(base),
		instructionProtocol: base.instructionProtocol || {
			summary: PROTOCOL_SUMMARY,
			resolveAction: "instructionResolve",
			getAction: "instructionGet"
		},
		BH: base.BH,
		status: base.status,
		pending: base.pending,
		queued: base.queued,
		running: base.running,
		done: base.done,
		error: base.error,
		receiptId: base.receiptId || base.receipt?.receiptId || base.actionId,
		workerId: base.workerId || base.receipt?.workerId,
		evidence: Helpers.evidence(base),
		nextAction: Helpers.actionPayload(base.nextAction || base.statusPayload || base.waitPayload),
		outputPage: Helpers.pagePayload(base.stdoutPagePayload || base.outputPagePayload || base.nextPagePayload),
		debugRef: base.detailsRef || base.outputRef || base.actionId || base.receipt?.receiptId,
		responseShape: base.responseShape || "simple-envelope-v11",
		previewRequired: false,
		responseFocus: focus(base.responseFocus),
		previewPolicy: previewPolicy(base.previewPolicy)
	});
}

/** Copies authoritative request and action identity without pulling in telemetry trees. */
function correlation(base = {}) {
	return project(base, Definitions.CORRELATION_KEYS, "TUNNEL_RESPONSE");
}

/** Projects only keys permitted by the selected response tier. */
function project(base = {}, keys = [], defaultType = "") {
	const output = {};
	for (const key of keys) {
		if (base[key] !== undefined) output[key] = Helpers.trimValue(base[key]);
	}
	if (defaultType && !output.type) output.type = defaultType;
	return output;
}

/** Keeps preview policy explicit and disabled unless a preview workflow re-enables it. */
function focus(value = {}) {
	return { ...value, previewRequired: false, reason: value.reason || "simple_response_default" };
}

/** Keeps preview rendering opt-in for ordinary tunnel control responses. */
function previewPolicy(value = {}) {
	return { ...value, enabled: false, reason: value.reason || "simple_response_default" };
}

module.exports = {
	CORRELATION_KEYS: Definitions.CORRELATION_KEYS,
	DEBUG_MODES: Definitions.DEBUG_MODES,
	ESSENTIAL_KEYS: Definitions.ESSENTIAL_KEYS,
	clean: Helpers.clean,
	correlation,
	publicEnvelope,
	wantsDebug: Policy.wantsDebug
};
