// B"H
// Boruch Hashem
// Blessed is He

const NativeRecovery = require("../runtime/priority/nativeGenerationRecovery.js");
const SemanticRecovery = require("./mailbox-semantic-recovery.js");

/**
 * @file Holds the parent-owned live mailbox and heals stale exact custody independently.
 * @description
 * The Awtsmoos leaves a living repair hand beside the mailbox itself. Awtsmoos.com
 * does not reconstruct a second facade for emergency work; P0 and the periodic healer
 * touch the exact custody map owned by the controller and escalate only when ambiguity remains.
 */
let liveMailbox = null;
let timer = null;
let lastRecovery = null;
const INTERVAL_MS = 2000;

function register(mailbox, options = {}) {
	liveMailbox = mailbox || null;
	stop();
	if (!liveMailbox) return false;
	const intervalMs = Math.max(500, Number(options.intervalMs || INTERVAL_MS));
	timer = setInterval(() => autoReconcile(), intervalMs);
	timer.unref?.();
	return true;
}

function autoReconcile() {
	if (!liveMailbox) return null;
	const snapshot = liveMailbox.snapshot();
	if (Number(snapshot.inbox?.parentCustodyStaleCount || 0) < 1) return null;
	return reconcile("periodic_stale_custody");
}

function reconcile(reason = "p0_mailbox_reconcile") {
	if (!liveMailbox) return unavailable();
	lastRecovery = SemanticRecovery.reconcile(liveMailbox, { reason });
	if (lastRecovery.replacementRequired) {
		lastRecovery.replacement = NativeRecovery.schedule(`mailbox:${reason}`);
	}
	return lastRecovery;
}

function status() {
	if (!liveMailbox) return unavailable();
	return { ok: true, registered: true, mailbox: liveMailbox.snapshot(), lastRecovery };
}

function evidence(includePayloads = false) {
	if (!liveMailbox) return unavailable();
	return { ok: true, registered: true, evidence: liveMailbox.evidence(includePayloads) };
}

function quarantine(payload = {}) {
	if (!liveMailbox) return unavailable();
	if (payload.confirm !== true) {
		return { ok: false, error: "confirmation_required",
			confirmPayload: { action: "connectionMailboxQuarantine", confirm: true } };
	}
	if (payload.id) {
		const record = liveMailbox.evidence(false).custody.find(item => item.id === payload.id);
		if (record && SemanticRecovery.resultMustSurvive(record)) {
			return { ok: false, error: "result_waiting_for_ack_preserved", id: payload.id };
		}
		return { ok: true, quarantined: liveMailbox.quarantineExact(payload.id, "p0_exact_quarantine") };
	}
	return reconcile("p0_confirmed_semantic_quarantine");
}

function stop() {
	if (!timer) return;
	clearInterval(timer);
	timer = null;
}

function unavailable() {
	return { ok: false, registered: false, error: "live_mailbox_unavailable" };
}

module.exports = { INTERVAL_MS, evidence, quarantine, reconcile, register, status, stop };
