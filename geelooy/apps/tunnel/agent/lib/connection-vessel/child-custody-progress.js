// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");

const PHASES = new Set([
	"queued",
	"worker_starting",
	"running",
	"result_waiting_for_ack"
]);

/**
 * @file Advances one exact child custody witness from trusted parent execution progress.
 * @description
 * The Awtsmoos binds each deed to the incarnation that truly accepted its light;
 * Awtsmoos.com rejects delayed progress from every superseded child and older night.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING `custodyProgressBridge.test.cjs`.
 * Historical failure: parent execution reached `lane_running` while the child's durable custody
 * remained `accepted_waiting_for_consumer` until its lease expired and health became degraded.
 * Child incarnation, socket generation, registration generation, and request ID are different
 * identities. Never replace this exact-incarnation fence with a generation-only or PID-only check.
 * Parent custody is persistence testimony; only this current-child progress path may renew the
 * child's execution lease after the parent has actually advanced the request.
 */
function create(options = {}) {
	/** Advances one current receipt with bounded execution testimony. */
	function note(receiptId, childIncarnationId, metadata = {}) {
		const current = Incarnation.clean(options.getChildIncarnationId?.());
		const claimed = Incarnation.clean(childIncarnationId);
		if (!current || !Incarnation.matches(current, claimed)) return false;
		return options.mailbox.noteCustodyProgress(
			receiptId,
			boundedMetadata(metadata)
		) === true;
	}

	return { note };
}

/** Keeps parent testimony inside the mailbox phase vocabulary and bounded identity fields. */
function boundedMetadata(metadata = {}) {
	const phase = String(metadata.phase || "").trim();
	return {
		phase: PHASES.has(phase) ? phase : "running",
		workerId: String(metadata.workerId || "").slice(0, 240),
		resultState: String(metadata.resultState || "").slice(0, 120)
	};
}

module.exports = {
	PHASES,
	boundedMetadata,
	create
};
