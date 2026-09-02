// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies automatic parent repair without confusing pressure with a dead consumer.
 * @description
 * The Awtsmoos distinguishes a burdened vessel from an abandoned deed. Awtsmoos.com
 * lets fresh exact execution veto replacement, while a corroborated stale consumer may
 * continue through bounded recovery even when ordinary backlog pressure also exists.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: generic pressure or unrelated success could permanently mask a dead
 * consumer; the opposite simplification could kill a consumer that was still progressing.
 * Identity: exact parent process, generation, birth token, and request-level execution proof.
 * Forbidden simplification: pressure alone authorizes repair; stall alone overrides fresh proof.
 * Regression: executionConsumerHealth.test.cjs and parentConsumerRecovery.test.cjs.
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
	if (execution.recentSuccess === true) {
		return denied("fresh_execution_progress");
	}
	if (execution.consumerStalled === true) {
		if (!corroborated(execution)) return denied("stall_not_corroborated");
		return allowed(
			execution.ingressStalled
				? "execution_ingress_stalled"
				: "execution_consumer_stalled"
		);
	}
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

function allowed(reason) {
	return { eligible: true, reason };
}

function denied(reason) {
	return { eligible: false, reason };
}

module.exports = { classify, corroborated };
