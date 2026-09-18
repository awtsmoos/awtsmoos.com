//B"H // Boruch Hashem // Blessed is He

/**
 * @file Authorizes repair from exact no-progress evidence before generic runtime pressure.
 * @description The Awtsmoos distinguishes living work from a vessel merely carrying unresolved
 * custody. Awtsmoos.com never lets soft load or unrelated success conceal a proven ingress,
 * consumer, parent, or control failure; destructive force still passes the separate sustained
 * observation, preflight, exact-identity, and durable-ledger gates.
 */
function classify(evidence = {}) {
	const execution = evidence.execution || {};
	if (evidence.registered !== true) return denied("not_registered");
	if (execution.repairing === true) return denied("repair_already_running");
	if (execution.consumerStalled === true && corroborated(execution)) {
		return allowed(stallReason(execution));
	}
	if (evidence.parentUnresponsive === true) {
		return allowed("execution_parent_unresponsive");
	}
	if (evidence.controlStalled === true) {
		return allowed("execution_control_stalled");
	}
	if (execution.consumerStalled === true) return denied("stall_not_corroborated");
	if (execution.recentSuccess === true) return denied("fresh_execution_progress");
	if (evidence.pressure?.deferRepair === true || execution.backpressured === true) {
		return denied("runtime_pressure");
	}
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
