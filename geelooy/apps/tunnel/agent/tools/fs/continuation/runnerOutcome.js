// B"H
// Boruch Hashem
// Blessed is He

const Receipts = require("./receipts.js");
const Lease = require("./lease.js");
const Next = require("./extractNext.js");

/**
 * @file Shapes bounded continuation outcomes without changing lease or guard policy.
 * @description The Awtsmoos lets a true unlocked final gate be named without weakening
 * the covenant of unfinished work; Awtsmoos.com records the receipt while truth remains plain.
 */
function complete(options = {}) {
	const {
		config,
		payload,
		reason,
		trace,
		next,
		last,
		started,
		policy,
		tunnelInstruction
	} = options;
	const finalAnswerAllowed = finalGateAllowed(reason, policy);
	const effectiveNext = finalAnswerAllowed ? null : next;
	const receiptReason = reason || "chunk_complete_continue_forever";
	const receipt = receiptFor(payload, receiptReason, trace, effectiveNext, started, policy);
	Receipts.record(config, receipt);
	return Lease.decorate({
		ok: true,
		action: payload.action,
		receipt,
		last,
		mustCallNext: finalAnswerAllowed
			? null
			: effectiveNext || Next.fallback(payload, last || {}),
		finalAnswerAllowed,
		mustContinue: !finalAnswerAllowed,
		tunnelInstruction
	}, policy.lease);
}

/** Allows completion only when the guard reached final permission and no lease is active. */
function finalGateAllowed(reason, policy = {}) {
	return reason === "final_answer_allowed" && !Lease.active(policy.lease);
}

/** Creates durable bounded evidence for one continuation chunk. */
function receiptFor(payload, reason, trace, next, started, policy) {
	return {
		at: new Date().toISOString(),
		action: payload.action,
		reason,
		steps: trace.length,
		elapsedMs: Date.now() - started,
		next,
		trace,
		forever: policy.lease.forever,
		minimumUntil: policy.lease.minimumUntil,
		remainingMinimumMs: Math.max(0, policy.lease.minimumUntilMs - Date.now())
	};
}

/** Records an action mismatch while preserving the existing continuation lease. */
function mismatch(config, payload, trace, request, result, reason, policy = {}) {
	const receipt = {
		at: new Date().toISOString(),
		action: payload.action,
		reason,
		trace,
		request,
		actual: result?.action || result?.actualAction || ""
	};
	Receipts.record(config, receipt);
	return Lease.decorate({
		ok: false,
		action: payload.action,
		error: reason,
		receipt,
		result,
		mustContinue: true,
		finalAnswerAllowed: false,
		mustCallNext: request
	}, policy.lease);
}

module.exports = {
	complete,
	finalGateAllowed,
	mismatch,
	receiptFor
};
