// B"H
const Definitions = require('./response-surface-definitions.js');
const Helpers = require('./response-surface-helpers.js');

/** B"H — Compact responses retain identity, queue proof, receipts, and recovery. */
function wantsDebug(payload = {}, result = {}) {
	const mode = String(
		payload.responseMode || payload.mode || result.responseMode || ''
	).toLowerCase();
	return Definitions.DEBUG_MODES.has(mode) ||
		payload.debug === true ||
		payload.full === true ||
		result.debug === true;
}

function publicEnvelope(base = {}, payload = {}, result = {}) {
	if (wantsDebug(payload, result)) return base;
	return Helpers.clean({
		...correlation(base),
		...essentials(base),
		BH: base.BH,
		ok: base.ok !== false,
		action: base.action || base.actualAction || base.requestAction,
		status: base.status,
		pending: base.pending,
		running: base.running,
		done: base.done,
		error: base.error,
		summary: Helpers.summary(base),
		next: Helpers.next(base),
		receiptId: base.receiptId || base.receipt?.receiptId || base.actionId,
		workerId: base.workerId || base.receipt?.workerId,
		missionId: base.missionId || base.mission?.missionId,
		conversationId: base.conversationId,
		evidence: Helpers.evidence(base),
		nextAction: Helpers.actionPayload(
			base.nextAction || base.statusPayload || base.waitPayload
		),
		outputPage: Helpers.pagePayload(
			base.stdoutPagePayload || base.outputPagePayload || base.nextPagePayload
		),
		debugRef: base.detailsRef || base.outputRef || base.actionId || base.receipt?.receiptId,
		responseShape: base.responseShape || 'simple-envelope-v10',
		previewRequired: false,
		responseFocus: {
			...(base.responseFocus || {}),
			previewRequired: false,
			reason: base.responseFocus?.reason || 'simple_response_default'
		},
		previewPolicy: {
			...(base.previewPolicy || {}),
			enabled: false,
			reason: base.previewPolicy?.reason || 'simple_response_default'
		}
	});
}

function correlation(base = {}) {
	const out = {};
	for (const key of Definitions.CORRELATION_KEYS) {
		if (base[key] !== undefined) out[key] = base[key];
	}
	if (!out.type) out.type = 'TUNNEL_RESPONSE';
	return out;
}

function essentials(base = {}) {
	const out = {};
	for (const key of Definitions.ESSENTIAL_KEYS) {
		if (base[key] !== undefined) out[key] = Helpers.trimValue(base[key]);
	}
	return out;
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
