// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Work = require("./parent-consumer-stuck-work.js");
const CANDIDATE_PROBE_MODE = "candidate-probe";

/**
 * @file Safely authorizes Awtsmoos.com consumer repair from independent proof.
 * The Awtsmoos distinguishes a living command from a stranded plea;
 * a candidate may never claim the incumbent's recovery decree.
 */
function classify(evidence = {}) {
	const execution = evidence.execution || {};
	if (evidence.registered !== true) return denied("not_registered");
	if (execution.repairing === true) return denied("repair_already_running");
	const mode = execution.candidateMode ||
		process.env.AWTSMOOS_REGISTRATION_MODE || "owning";
	if (mode === CANDIDATE_PROBE_MODE) return denied("candidate_probe_exempt");
	if (evidence.parentUnresponsive === true) {
		return allowed("execution_parent_unresponsive");
	}
	if (evidence.controlStalled === true) {
		return allowed("execution_control_stalled");
	}
	if (ingressOnly(execution) && freshActiveProgress(evidence)) {
		return denied("fresh_execution_progress");
	}
	// Exact stage and orphan testimony may precede a delayed aggregate flag.
	// Positive stuck-work custody remains mandatory, as do downstream preflight,
	// identity, sustained observation and anti-flap gates.
	const independent = execution.stageStalled === true ||
		execution.orphanStalled === true;
	const stallSignaled = execution.consumerStalled === true || independent;
	if (stallSignaled && corroborated(execution) && Work.stuckWorkEvidence(execution)) {
		return allowed(stallReason(execution));
	}
	if (stallSignaled && corroborated(execution)) {
		return denied("stall_no_stuck_work");
	}
	if (execution.consumerStalled === true) return denied("stall_not_corroborated");
	if (execution.recentSuccess === true) return denied("fresh_execution_progress");
	if (evidence.pressure?.deferRepair === true || execution.backpressured === true) {
		return denied("runtime_pressure");
	}
	return denied("consumer_healthy");
}

/** An ingress-only delay must not preempt proven active work. */
function ingressOnly(execution = {}) {
	return execution.ingressStalled === true &&
		execution.stageStalled !== true &&
		execution.orphanStalled !== true &&
		!hasStalledLanes(execution);
}

/** A different task's fresh progress vetoes ingress-only repair. */
function freshActiveProgress(evidence = {}) {
	const execution = evidence.execution || {};
	const pressure = evidence.pressure || {};
	return execution.recentSuccess === true &&
		pressure.activeWork === true &&
		pressure.forwardProgressFresh !== false;
}

/** Independent lane, stage, orphan or ingress evidence confirms a stall. */
function corroborated(execution = {}) {
	return execution.ingressStalled === true ||
		execution.stageStalled === true ||
		execution.orphanStalled === true || hasStalledLanes(execution);
}

function hasStalledLanes(execution = {}) {
	return Array.isArray(execution.stalledLanes) && execution.stalledLanes.length > 0;
}

function stallReason(execution = {}) {
	return ingressOnly(execution) ? "execution_ingress_stalled" :
		"execution_consumer_stalled";
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
	queueDepthGrowing: Work.queueDepthGrowing,
	stallReason,
	stuckWorkEvidence: Work.stuckWorkEvidence
};
