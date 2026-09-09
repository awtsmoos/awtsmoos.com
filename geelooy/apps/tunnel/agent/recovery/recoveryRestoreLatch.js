// B"H
// Boruch Hashem
// Blessed is He

const RegistrationPolicy = require("./registrationFailurePolicy.js");

const STALE_CRASH_LOOP_MS = 30 * 60 * 1000;

/**
 * @file Releases obsolete recovery latches without hiding present corruption.
 * @description
 * The Awtsmoos remembers a real wound, yet memory must not become an eternal wound.
 * Awtsmoos.com clears transport-only restore requests once current bytes are healthy,
 * and clears an old crash-loop request only after a long quiet interval with no
 * consecutive crash evidence. Fresh crashes and failed integrity remain fail-closed.
 */
function reconcile(current = {}, health = {}, now = Date.now()) {
	if (current.restoreRequired !== true || health.ok !== true) return current;
	const reason = String(current.restoreReason || "");
	const classification = RegistrationPolicy.classify(reason);
	if (classification.kind === "transport") {
		return clear(current, reason, "transport_recovered", now);
	}
	if (reason === "rapid_crash_loop" && crashLoopIsStale(current, now)) {
		return clear(current, reason, "crash_loop_quiet", now);
	}
	return current;
}

/** Returns true only when the crash-loop testimony is old and no new crash remains. */
function crashLoopIsStale(current, now) {
	if (Number(current.consecutiveFailures || 0) !== 0) return false;
	const recordedAt = Date.parse(current.lastDowngradeAt || "");
	if (!Number.isFinite(recordedAt) || now < recordedAt) return false;
	return now - recordedAt >= STALE_CRASH_LOOP_MS;
}

/** Clears only the rollback covenant while preserving historical diagnostic testimony. */
function clear(current, previousReason, cause, now) {
	return {
		...current,
		restoreRequired: false,
		restoreReason: "",
		restoreEligibleRegistrationFailures: 0,
		lastRestoreReconciledAt: new Date(now).toISOString(),
		lastRestoreReconciledReason: previousReason,
		lastRestoreReconciledCause: cause
	};
}

module.exports = {
	STALE_CRASH_LOOP_MS,
	crashLoopIsStale,
	reconcile
};
