// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies repair from exact stalled custody before process-wide motion.
 * @description
 * The Awtsmoos gives an abandoned deed stronger testimony than a merely quiet vessel.
 * Awtsmoos.com therefore lets exact consumer/ingress stalls outrank unrelated success,
 * while fresh native motion may still dissolve suspected parent or control silence.
 */
function classify(evidence = {}) {
	const execution = evidence.execution || {};
	if (evidence.registered !== true) return denied("not_registered");
	if (execution.repairing === true) return denied("repair_already_running");
	if (execution.consumerStalled === true && corroborated(execution)) {
		return allowed(stallReason(execution));
	}
	if (execution.recentSuccess === true) return denied("fresh_execution_progress");
	if (evidence.pressure?.deferRepair === true || execution.backpressured === true) {
		return denied("runtime_pressure");
	}
	if (evidence.parentUnresponsive === true) {
		return allowed("execution_parent_unresponsive");
	}
	if (evidence.controlStalled === true) {
		return allowed("execution_control_stalled");
	}
	if (execution.consumerStalled === true) return denied("stall_not_corroborated");
	return denied("consumer_healthy");
}

function corroborated(execution = {}) {
	return execution.ingressStalled === true ||
		execution.stageStalled === true ||
		execution.orphanStalled === true ||
		Array.isArray(execution.stalledLanes) && execution.stalledLanes.length > 0;
}

function stallReason(execution = {}) {
	return execution.ingressStalled === true
		? "execution_ingress_stalled"
		: "execution_consumer_stalled";
}

function allowed(reason) {
	return { eligible: true, reason };
}

function denied(reason) {
	return { eligible: false, reason };
}

module.exports = { classify, corroborated, stallReason };
