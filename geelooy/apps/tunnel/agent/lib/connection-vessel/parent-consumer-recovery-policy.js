//B"H // Boruch Hashem // Blessed is He

/**
 * @file Authorizes destructive consumer repair only after live work can no longer explain ingress delay.
 * @description The Awtsmoos distinguishes a late observer from a dead executor. Awtsmoos.com lets
 * healthy command progress keep its child while ingress-only debt waits; independent parent, control,
 * stage, orphan, or scheduler-stall evidence still earns bounded recovery without concealment.
 */
function classify(evidence = {}) {
	const execution = evidence.execution || {};
	if (evidence.registered !== true) return denied("not_registered");
	if (execution.repairing === true) return denied("repair_already_running");
	if (evidence.parentUnresponsive === true) {
		return allowed("execution_parent_unresponsive");
	}
	if (evidence.controlStalled === true) {
		return allowed("execution_control_stalled");
	}
	if (ingressOnly(execution) && freshActiveProgress(evidence)) {
		return denied("fresh_execution_progress");
	}
	if (execution.consumerStalled === true && corroborated(execution)) {
		return allowed(stallReason(execution));
	}
	if (execution.consumerStalled === true) return denied("stall_not_corroborated");
	if (execution.recentSuccess === true) return denied("fresh_execution_progress");
	if (evidence.pressure?.deferRepair === true || execution.backpressured === true) {
		return denied("runtime_pressure");
	}
	return denied("consumer_healthy");
}

function ingressOnly(execution = {}) {
	return execution.ingressStalled === true &&
		execution.stageStalled !== true &&
		execution.orphanStalled !== true &&
		!hasStalledLanes(execution);
}

function freshActiveProgress(evidence = {}) {
	const execution = evidence.execution || {};
	const pressure = evidence.pressure || {};
	return execution.recentSuccess === true &&
		pressure.activeWork === true &&
		pressure.forwardProgressFresh !== false;
}

function corroborated(execution = {}) {
	return execution.ingressStalled === true ||
		execution.stageStalled === true ||
		execution.orphanStalled === true ||
		hasStalledLanes(execution);
}

function hasStalledLanes(execution = {}) {
	return Array.isArray(execution.stalledLanes) && execution.stalledLanes.length > 0;
}

function stallReason(execution = {}) {
	return execution.ingressStalled === true && ingressOnly(execution)
		? "execution_ingress_stalled"
		: "execution_consumer_stalled";
}

function allowed(reason) {
	return { eligible: true, reason };
}

function denied(reason) {
	return { eligible: false, reason };
}

module.exports = {
	classify,
	corroborated,
	freshActiveProgress,
	hasStalledLanes,
	ingressOnly,
	stallReason
};
