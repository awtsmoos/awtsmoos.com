// B"H
// Boruch Hashem
// Blessed is He

const Evidence = require("./parent-consumer-evidence.js");
const Orphan = require("./parent-consumer-orphan.js");
const Values = require("./parent-consumer-health-values.js");

const DEFAULT_CONSUMER_STALE_MS = 30000;

/**
 * @file Judges consumer health from exact custody and execution testimony.
 * @description
 * The Awtsmoos renews each deed in its own vessel. Awtsmoos.com keeps recent-success
 * telemetry visible, but unrelated successful work can no longer forgive one expired
 * custody record. Exact request progress renews that record's lease instead.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: one stale request stayed only degraded because another request
 * completed recently. Root cause: process-wide lastSuccessfulActionAt masked exact debt.
 * Forbidden simplification: use aggregate recent success as ownership or liveness proof.
 * Regression: executionConsumerHealth.test.cjs and exactCustodyHealth.test.cjs.
 */
function inspect(stats = {}, mailbox = {}, options = {}) {
	const consumerStaleMs = Values.bounded(
		options.consumerStaleMs,
		DEFAULT_CONSUMER_STALE_MS
	);
	const registered = options.registered === true;
	const orphanRecovery = options.orphanRecovery === true;
	const inbox = mailbox.inbox || {};
	const stages = Values.executionStages(stats.executionStages);
	const executor = Values.executorSummary(stats.filesystemExecutor);
	const custody = Evidence.custodyEvidence(inbox);
	const impossibleLanes = Values.laneIntegrity(stats.lanes || {})
		.filter((lane) => lane.impossible);
	const stalledLanes = Values.staleIdleLanes(stats.lanes, consumerStaleMs);
	const stageWaiting = stages.waitingForConsumer > 0 &&
		stages.oldestUnstartedAgeMs >= consumerStaleMs;
	const saturated = Values.executorSaturated(executor) && stageWaiting;
	const stageStalled = stageWaiting && !saturated;
	const laneStalled = custody.oldestAgeMs >= consumerStaleMs &&
		stalledLanes.length > 0;
	const orphan = Orphan.inspect(
		stats,
		custody,
		stages,
		consumerStaleMs,
		options.orphanStaleMs
	);
	const orphanStalled = orphanRecovery && orphan.orphanedCustody;
	const stallEvidence = stageStalled || laneStalled || orphanStalled;
	const progress = Evidence.recentProgress(stats, consumerStaleMs, options.now);
	const degradedCustody = registered && custody.count > 0 && stallEvidence;
	const consumerStalled = degradedCustody;
	const schedulerCorrupt = impossibleLanes.length > 0;
	const backpressured = registered && custody.count > 0 && saturated;
	const healthy = !schedulerCorrupt && !consumerStalled && !backpressured;

	return {
		healthy,
		state: Evidence.healthState(
			schedulerCorrupt,
			consumerStalled,
			backpressured,
			degradedCustody
		),
		schedulerCorrupt,
		impossibleLanes,
		consumerStalled,
		degradedCustody,
		backpressured,
		consumerStaleMs,
		unresolved: custody.count,
		acceptedAgeMs: custody.oldestAgeMs,
		durableUnresolved: Values.nonnegative(inbox.count),
		custodyAware: custody.aware,
		orphanRecovery,
		orphanStalled,
		stageStalled,
		stages,
		stalledLanes,
		queued: Values.nonnegative(stats.queued),
		inflight: Values.nonnegative(stats.inflight),
		filesystemExecutor: executor,
		...progress,
		...orphan
	};
}

module.exports = {
	DEFAULT_CONSUMER_STALE_MS,
	bounded: Values.bounded,
	custodyEvidence: Evidence.custodyEvidence,
	executionStages: Values.executionStages,
	executorSaturated: Values.executorSaturated,
	executorSummary: Values.executorSummary,
	healthState: Evidence.healthState,
	inspect,
	nonnegative: Values.nonnegative,
	recentProgress: Evidence.recentProgress,
	staleIdleLanes: Values.staleIdleLanes
};
