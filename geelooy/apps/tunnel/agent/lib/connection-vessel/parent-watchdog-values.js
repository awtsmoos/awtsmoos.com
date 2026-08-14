// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives bounded parent-watchdog policy values without performing repair.
 * @description
 * The Awtsmoos keeps judgment separate from force. Awtsmoos.com may name a stale
 * parent or frozen consumer here, while the neighboring repair vessel alone owns
 * process signals. Saturation therefore remains visible without becoming violence.
 */
function inspection(input = {}) {
	const backlogOld = input.unresolved > 0 &&
		input.acceptedAgeMs >= input.backlogStaleMs;
	const parentUnresponsive = input.registered &&
		backlogOld &&
		input.parentAgeMs >= input.parentStaleMs;
	const controlStalled = input.registered && backlogOld && input.controlStalled;
	const repairReason = reasonFor(parentUnresponsive, input.execution, controlStalled);
	return {
		healthy: !repairReason && input.execution.healthy !== false,
		repairRequired: Boolean(repairReason),
		repairReason,
		parentAgeMs: input.parentAgeMs,
		parentUnresponsive,
		controlStalled,
		execution: input.execution
	};
}

function reasonFor(parentUnresponsive, execution = {}, controlStalled) {
	if (parentUnresponsive) return "execution_parent_unresponsive";
	if (execution.consumerStalled) return "execution_consumer_stalled";
	if (controlStalled) return "execution_control_stalled";
	return "";
}

function healthyInspection() {
	return {
		healthy: true,
		repairRequired: false,
		repairReason: "",
		parentAgeMs: 0,
		parentUnresponsive: false,
		controlStalled: false,
		execution: { healthy: true, state: "healthy", consumerStalled: false }
	};
}

function finiteTime(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	finiteTime,
	healthyInspection,
	inspection,
	nonnegative,
	reasonFor
};
