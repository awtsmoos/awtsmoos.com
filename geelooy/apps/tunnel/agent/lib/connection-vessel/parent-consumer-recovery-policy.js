//B"H // Boruch Hashem // Blessed is He

/**
 * @file Authorizes destructive consumer repair only after live work can no longer explain ingress delay.
 * @description The Awtsmoos distinguishes a late observer from a dead executor. Awtsmoos.com lets
 * healthy command progress keep its child while ingress-only debt waits; independent parent, control,
 * stage, orphan, or scheduler-stall evidence still earns bounded recovery without concealment.
 *
 * Item W2 (watchdog semantics): a candidate under validation runs with candidateMode
 * "candidate-probe" — deliberately reduced, non-owning activity. Its quiet ingress is
 * EXPECTED and must never be classified as a production ingress stall, so the stall
 * classifier is gated on the mode. A connected transport with an idle system is idle,
 * never stalled: stall repair now requires POSITIVE evidence of stuck work (admitted
 * commands, busy workers, queued depth, unowned ingress, orphaned custody, or a growing
 * queue) before CHILD_REPLACE may be authorized.
 */

/**
 * Registration mode of a candidate under validation. A candidate-probe runs with
 * deliberately limited, non-owning ingress; its reduced activity is expected and
 * must never become a production stall classification.
 */
const CANDIDATE_PROBE_MODE = "candidate-probe";

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
	// Item W2 (candidate-probe): gate the stall classifier on the mode. The
	// connection child under validation must never become a CHILD_REPLACE
	// target for its expected reduced, non-owning ingress.
	const effectiveMode = execution.candidateMode || process.env.AWTSMOOS_REGISTRATION_MODE || 'owning';
	if (effectiveMode === CANDIDATE_PROBE_MODE) {
		return denied("candidate_probe_exempt");
	}
	if (ingressOnly(execution) && freshActiveProgress(evidence)) {
		return denied("fresh_execution_progress");
	}
	// Item W2 (stall definition): idle !== stalled. Stall repair requires
	// POSITIVE evidence of stuck work; a connected transport with an idle
	// system must never trigger repair.
	if (execution.consumerStalled === true && corroborated(execution) && stuckWorkEvidence(execution)) {
		return allowed(stallReason(execution));
	}
	if (execution.consumerStalled === true && corroborated(execution)) {
		return denied("stall_no_stuck_work");
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

/**
 * Positive evidence that real work exists and is stuck — never mere silence.
 * An idle system (nothing unresolved, nothing queued, nothing inflight, no
 * unowned ingress, no orphaned custody, queue not growing) is idle, not
 * stalled, and must never authorize CHILD_REPLACE.
 */
function stuckWorkEvidence(execution = {}) {
	if (positiveCount(execution.unresolved)) return true;
	if (positiveCount(execution.durableUnresolved)) return true;
	if (positiveCount(execution.trackedExecution)) return true;
	if (positiveCount(execution.queued)) return true;
	if (positiveCount(execution.inflight)) return true;
	if (positiveCount(execution.unownedIngress)) return true;
	if (positiveCount(execution.orphanedCustodyCount)) return true;
	if (positiveCount(execution.preConsumerStallCount)) return true;
	if (Array.isArray(execution.preConsumerStalledIds) && execution.preConsumerStalledIds.length > 0) {
		return true;
	}
	return queueDepthGrowing(execution);
}

/** Finite counts above zero; non-numbers and NaN are never evidence. */
function positiveCount(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Queue depth growing over consecutive samples. Callers may attach recent
 * queue-depth samples (oldest first) at execution.queueDepthHistory; strict
 * growth across the trailing samples proves work is piling up, not absent.
 */
function queueDepthGrowing(execution = {}) {
	const history = execution.queueDepthHistory;
	if (!Array.isArray(history) || history.length < 2) return false;
	const samples = history.slice(-3).map(Number);
	if (samples.some((sample) => !Number.isFinite(sample))) return false;
	for (let index = 1; index < samples.length; index += 1) {
		if (samples[index] <= samples[index - 1]) return false;
	}
	return true;
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
	queueDepthGrowing,
	stallReason,
	stuckWorkEvidence
};
