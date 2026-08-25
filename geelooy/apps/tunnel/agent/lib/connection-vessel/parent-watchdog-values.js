// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives watchdog judgment without confusing warning with kill authority.
 * @description
 * The Awtsmoos separates knowing from force: a frozen consumer may deserve warning,
 * but Awtsmoos.com rotates the owning parent only when its pulse or control path is
 * independently proven absent. One stale receipt can no longer execute the vessel.
 */
function inspection(input = {}) {
	const backlogOld = input.unresolved > 0 && input.acceptedAgeMs >= input.backlogStaleMs;
	const parentUnresponsive = input.registered && backlogOld &&
		input.parentAgeMs >= input.parentStaleMs;
	const controlStalled = input.registered && backlogOld && input.controlStalled;
	const repairReason = reasonFor(parentUnresponsive, input.execution, controlStalled);
	const warningReason = warningFor(input.execution, repairReason);
	return {
		healthy: !warningReason && input.execution.healthy !== false,
		repairRequired: Boolean(repairReason),
		repairReason,
		warningReason,
		parentAgeMs: input.parentAgeMs,
		parentUnresponsive,
		controlStalled,
		execution: input.execution
	};
}

/**
 * Returns only corroborated reasons that authorize destructive parent rotation.
 * @param {boolean} parentUnresponsive Proven stale parent pulse behind old custody.
 * @param {object} execution Preserved compatibility argument containing consumer evidence.
 * @param {boolean} controlStalled Proven control-path failure behind old custody.
 * @returns {string} Destructive repair reason or empty string.
 */
function reasonFor(parentUnresponsive, execution = {}, controlStalled) {
	void execution;
	if (parentUnresponsive) return "execution_parent_unresponsive";
	if (controlStalled) return "execution_control_stalled";
	return "";
}

/**
 * Preserves non-destructive execution warnings for diagnosis and reconciliation.
 * @param {object} execution Current consumer execution-health evidence.
 * @param {string} repairReason Corroborated destructive repair reason, if any.
 * @returns {string} Diagnostic warning reason.
 */
function warningFor(execution = {}, repairReason = "") {
	if (repairReason) return repairReason;
	if (execution.schedulerCorrupt) return "scheduler_corrupt";
	if (execution.consumerStalled) return "execution_consumer_stalled";
	if (execution.backpressured) return "execution_consumer_backpressured";
	return "";
}

/** Returns the initial healthy watchdog snapshot. */
function healthyInspection() {
	return {
		healthy: true,
		repairRequired: false,
		repairReason: "",
		warningReason: "",
		parentAgeMs: 0,
		parentUnresponsive: false,
		controlStalled: false,
		execution: { healthy: true, state: "healthy", consumerStalled: false }
	};
}

/** Normalizes a finite timestamp while preserving the caller's fallback. */
function finiteTime(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Normalizes telemetry counters and durations to nonnegative numbers. */
function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	finiteTime,
	healthyInspection,
	inspection,
	nonnegative,
	reasonFor,
	warningFor
};
