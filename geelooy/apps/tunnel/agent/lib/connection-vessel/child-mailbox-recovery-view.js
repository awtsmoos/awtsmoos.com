// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounds child-owned mailbox attention into parent-visible non-destructive testimony.
 * @description
 * The Awtsmoos lets one durable deed carry truth without carrying an ocean of state.
 * Awtsmoos.com keeps expired custody visible as attention while withholding repair authority,
 * so an old lease may warn the parent without becoming a sword against a healthy child.
 */

/**
 * Presents semantic recovery as a compact immutable child-state witness.
 * @param {object} result Result from child mailbox semantic reconciliation.
 * @returns {object} Bounded recovery testimony safe to mirror across IPC.
 */
function present(result = {}) {
	const actions = Array.isArray(result.actions) ? result.actions : [];
	const expired = boundedCount(result.expired);
	const quarantined = count(actions, "quarantined");
	const preserved = count(actions, "preserved");
	const failed = count(actions, "quarantine_failed");
	const attentionRequired = result.attentionRequired === true || expired > 0;
	const replacementRequired = result.replacementRequired === true;
	return {
		attempted: expired > 0,
		ok: result.ok === true,
		observedAt: boundedTime(result.observedAt),
		expired,
		quarantined,
		preserved,
		failed,
		attentionRequired,
		replacementRequired,
		reason: reason(actions, replacementRequired, attentionRequired, expired)
	};
}

/** Returns a stable semantic reason without exposing arbitrary error text. */
function reason(actions, replacementRequired, attentionRequired, expired) {
	if (replacementRequired) {
		if (actions.some(action => action?.operation === "quarantine_failed")) {
			return "quarantine_failed";
		}
		if (actions.some(action => action?.reason === "result_waiting_for_ack")) {
			return "result_waiting_for_ack";
		}
		if (actions.some(action => action?.reason === "missing_exact_custody_id")) {
			return "missing_exact_custody_id";
		}
		return "semantic_recovery_ambiguous";
	}
	if (attentionRequired) {
		if (actions.some(action => action?.reason === "result_waiting_for_ack")) {
			return "result_waiting_for_ack_attention";
		}
		if (actions.some(action => action?.reason === "missing_exact_custody_id")) {
			return "missing_exact_custody_id_attention";
		}
		return "semantic_attention_required";
	}
	if (actions.some(action => action?.operation === "quarantined")) {
		return "expired_pre_result_quarantined";
	}
	return expired > 0 ? "expired_custody_reconciled" : "no_expired_custody";
}

function count(actions, operation) {
	return actions.filter(action => action?.operation === operation).length;
}

function boundedCount(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.min(10000, Math.floor(number))) : 0;
}

function boundedTime(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

module.exports = { present, reason };
