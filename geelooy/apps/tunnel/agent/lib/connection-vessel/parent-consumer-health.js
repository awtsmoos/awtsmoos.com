// B"H
// Boruch Hashem
// Blessed is He

const Orphan = require("./parent-consumer-orphan.js");
const Values = require("./parent-consumer-health-values.js");

const DEFAULT_CONSUMER_STALE_MS = 30000;

/**
 * @file Separates living execution health from watchdog-only orphan recovery evidence.
 * @description
 * The Awtsmoos preserves every witness while each vessel receives only its own authority.
 * Awtsmoos.com exposes abandoned custody for diagnosis everywhere, yet only an explicit
 * recovery observer may let that historical evidence become permission to rotate a parent.
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
	const custody = custodyEvidence(inbox);
	const unresolved = custody.count;
	const acceptedAgeMs = custody.oldestAgeMs;
	const stalledLanes = Values.staleIdleLanes(stats.lanes, consumerStaleMs);
	const stageWaiting = stages.waitingForConsumer > 0 &&
		stages.oldestUnstartedAgeMs >= consumerStaleMs;
	const saturated = Values.executorSaturated(executor) && stageWaiting;
	const stageStalled = stageWaiting && !saturated;
	const laneStalled = acceptedAgeMs >= consumerStaleMs && stalledLanes.length > 0;
	const orphan = Orphan.inspect(
		stats,
		custody,
		stages,
		consumerStaleMs,
		options.orphanStaleMs
	);
	const orphanStalled = orphanRecovery && orphan.orphanedCustody;
	const consumerStalled = registered && unresolved > 0 && (
		stageStalled ||
		laneStalled ||
		orphanStalled
	);
	const backpressured = registered && unresolved > 0 && saturated;
	const healthy = !consumerStalled && !backpressured;

	return {
		healthy,
		state: healthState(consumerStalled, backpressured),
		consumerStalled,
		backpressured,
		consumerStaleMs,
		unresolved,
		acceptedAgeMs,
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
		...orphan
	};
}

/** Uses generation-local custody when exposed, preserving legacy compatibility. */
function custodyEvidence(inbox = {}) {
	const aware = Number.isFinite(Number(inbox.parentCustodyCount));

	return {
		aware,
		count: Values.nonnegative(aware ? inbox.parentCustodyCount : inbox.count),
		oldestAgeMs: Values.nonnegative(
			aware ? inbox.parentCustodyOldestAgeMs : inbox.oldestAgeMs
		)
	};
}

function healthState(stalled, backpressured) {
	if (stalled) return "consumer_stalled";
	if (backpressured) return "consumer_backpressured";
	return "healthy";
}

module.exports = {
	DEFAULT_CONSUMER_STALE_MS,
	bounded: Values.bounded,
	custodyEvidence,
	executionStages: Values.executionStages,
	executorSaturated: Values.executorSaturated,
	executorSummary: Values.executorSummary,
	healthState,
	inspect,
	nonnegative: Values.nonnegative,
	staleIdleLanes: Values.staleIdleLanes
};
