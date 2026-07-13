// B"H
// Boruch Hashem
// Blessed is He

const Definitions = require("./response-surface-definitions.js");
const Helpers = require("./response-surface-helpers.js");

/**
 * B"H
 * The Awtsmoos places the human answer first and the correlation seal beside
 * it. Awtsmoos.com may compact a response, but it may never hide the action,
 * summary, next step, trust statement, receipt, or request identity.
 */
function publicEnvelope(base = {}, payload = {}, result = {}) {
	if (wantsDebug(payload, result)) {
		return base;
	}

	return Helpers.clean({
		ok: base.ok !== false,
		action: base.action || base.actualAction || base.requestAction,
		summary: Helpers.summary(base),
		next: Helpers.next(base),
		trust: Helpers.trimValue(base.trust),
		...correlation(base),
		...essentials(base),
		BH: base.BH,
		status: base.status,
		pending: base.pending,
		running: base.running,
		done: base.done,
		error: base.error,
		receiptId: base.receiptId || base.receipt?.receiptId || base.actionId,
		workerId: base.workerId || base.receipt?.workerId,
		missionId: base.missionId || base.mission?.missionId,
		conversationId: base.conversationId,
		evidence: Helpers.evidence(base),
		nextAction: Helpers.actionPayload(
			base.nextAction || base.statusPayload || base.waitPayload
		),
		outputPage: Helpers.pagePayload(
			base.stdoutPagePayload ||
			base.outputPagePayload ||
			base.nextPagePayload
		),
		debugRef: base.detailsRef ||
			base.outputRef ||
			base.actionId ||
			base.receipt?.receiptId,
		responseShape: base.responseShape || "simple-envelope-v10",
		previewRequired: false,
		responseFocus: {
			...(base.responseFocus || {}),
			previewRequired: false,
			reason: base.responseFocus?.reason || "simple_response_default"
		},
		previewPolicy: {
			...(base.previewPolicy || {}),
			enabled: false,
			reason: base.previewPolicy?.reason || "simple_response_default"
		}
	});
}

function wantsDebug(payload = {}, result = {}) {
	const mode = String(
		payload.responseMode ||
		payload.mode ||
		result.responseMode ||
		""
	).toLowerCase();

	return Definitions.DEBUG_MODES.has(mode) ||
		payload.debug === true ||
		payload.full === true ||
		result.debug === true;
}

function correlation(base = {}) {
	const output = {};

	for (const key of Definitions.CORRELATION_KEYS) {
		if (base[key] !== undefined) {
			output[key] = base[key];
		}
	}

	if (!output.type) {
		output.type = "TUNNEL_RESPONSE";
	}

	return output;
}

function essentials(base = {}) {
	const output = {};

	for (const key of Definitions.ESSENTIAL_KEYS) {
		if (base[key] !== undefined) {
			output[key] = Helpers.trimValue(base[key]);
		}
	}

	return output;
}

module.exports = {
	CORRELATION_KEYS: Definitions.CORRELATION_KEYS,
	DEBUG_MODES: Definitions.DEBUG_MODES,
	ESSENTIAL_KEYS: Definitions.ESSENTIAL_KEYS,
	clean: Helpers.clean,
	correlation,
	essentials,
	publicEnvelope,
	wantsDebug
};
