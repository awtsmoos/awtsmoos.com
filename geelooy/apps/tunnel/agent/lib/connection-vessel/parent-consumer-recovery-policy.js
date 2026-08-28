//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies every automatic parent-repair candidate before force may be claimed.
 * @description
 * The Awtsmoos distinguishes a silent vessel from a pressured or still-moving one;
 * Awtsmoos.com lets parent, control, and consumer failures share one guarded covenant.
 * Fresh progress and pressure veto every automatic sword before corroboration has begun.
 */
function classify(evidence = {}) {
	const execution = evidence.execution || {};
	if (evidence.registered !== true) return denied("not_registered");
	if (execution.repairing === true) return denied("repair_already_running");
	if (evidence.pressure?.deferRepair === true || execution.backpressured === true) {
		return denied("runtime_pressure");
	}
	if (execution.recentSuccess === true || execution.degradedCustody === true) {
		return denied("fresh_execution_progress");
	}
	if (evidence.parentUnresponsive === true) {
		return allowed("execution_parent_unresponsive");
	}
	if (evidence.controlStalled === true) {
		return allowed("execution_control_stalled");
	}
	if (execution.consumerStalled !== true) return denied("consumer_healthy");
	if (!corroborated(execution)) return denied("stall_not_corroborated");
	return allowed(
		execution.ingressStalled
			? "execution_ingress_stalled"
			: "execution_consumer_stalled"
	);
}

/** Requires an independent ingress/stage/orphan/lane witness for consumer-only stalls. */
function corroborated(execution = {}) {
	return execution.ingressStalled === true ||
		execution.stageStalled === true ||
		execution.orphanStalled === true ||
		Array.isArray(execution.stalledLanes) && execution.stalledLanes.length > 0;
}

function allowed(reason) {
	return { eligible: true, reason };
}

function denied(reason) {
	return { eligible: false, reason };
}

module.exports = {
	classify,
	corroborated
};
