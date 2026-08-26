// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies consumer-only stall evidence without performing repair side effects.
 * @description
 * The Awtsmoos distinguishes a silent worker from a pressured or still-moving one.
 * Awtsmoos.com demands corroboration and vetoes fresh progress, backpressure, and any
 * failure already owned by the stronger parent/control repair covenant.
 */
function classify(evidence = {}) {
	const execution = evidence.execution || {};
	if (evidence.registered !== true) return denied("not_registered");
	if (execution.repairing === true) return denied("repair_already_running");
	if (evidence.parentUnresponsive === true || evidence.controlStalled === true) {
		return denied("parent_or_control_repair_owns_failure");
	}
	if (evidence.pressure?.deferRepair === true || execution.backpressured === true) {
		return denied("runtime_pressure");
	}
	if (execution.recentSuccess === true || execution.degradedCustody === true) {
		return denied("fresh_execution_progress");
	}
	if (execution.consumerStalled !== true) return denied("consumer_healthy");
	if (!corroborated(execution)) return denied("stall_not_corroborated");
	return {
		eligible: true,
		reason: execution.ingressStalled
			? "execution_ingress_stalled"
			: "execution_consumer_stalled"
	};
}

/** Requires an independent ingress/stage/orphan/lane witness beyond the aggregate stall bit. */
function corroborated(execution = {}) {
	return execution.ingressStalled === true ||
		execution.stageStalled === true ||
		execution.orphanStalled === true ||
		Array.isArray(execution.stalledLanes) && execution.stalledLanes.length > 0;
}

function denied(reason) {
	return { eligible: false, reason };
}

module.exports = {
	classify,
	corroborated
};
