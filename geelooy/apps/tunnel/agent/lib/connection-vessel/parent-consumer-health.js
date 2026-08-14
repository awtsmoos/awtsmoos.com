// B"H
// Boruch Hashem
// Blessed is He

const Values = require("./parent-consumer-health-values.js");

const DEFAULT_CONSUMER_STALE_MS = 30000;

/**
 * @file Separates dead-consumer repair from honest executor backpressure.
 * @description
 * The Awtsmoos may reveal waiting because a worker is dead or because every worker
 * is faithfully busy. Awtsmoos.com marks both as not fully routable after a bound,
 * yet only the first authorizes consumer repair; saturation must drain, not restart.
 */
function inspect(stats = {}, mailbox = {}, options = {}) {
	const consumerStaleMs = Values.bounded(
		options.consumerStaleMs,
		DEFAULT_CONSUMER_STALE_MS
	);
	const registered = options.registered === true;
	const inbox = mailbox.inbox || {};
	const stages = Values.executionStages(stats.executionStages);
	const executor = Values.executorSummary(stats.filesystemExecutor);
	const unresolved = Values.nonnegative(inbox.count);
	const acceptedAgeMs = Values.nonnegative(inbox.oldestAgeMs);
	const stalledLanes = Values.staleIdleLanes(stats.lanes, consumerStaleMs);
	const stageWaiting = stages.waitingForConsumer > 0 &&
		stages.oldestUnstartedAgeMs >= consumerStaleMs;
	const saturated = Values.executorSaturated(executor) && stageWaiting;
	const stageStalled = stageWaiting && !saturated;
	const laneStalled = acceptedAgeMs >= consumerStaleMs && stalledLanes.length > 0;
	const consumerStalled = registered &&
		unresolved > 0 &&
		(stageStalled || laneStalled);
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
		stageStalled,
		stages,
		stalledLanes,
		queued: Values.nonnegative(stats.queued),
		inflight: Values.nonnegative(stats.inflight),
		filesystemExecutor: executor
	};
}

/**
 * Names the bounded execution state without making restart policy implicit.
 * @param {boolean} stalled Consumer failed to advance with usable capacity.
 * @param {boolean} backpressured All workers busy while accepted work waits.
 * @returns {string} Stable execution health state.
 */
function healthState(stalled, backpressured) {
	if (stalled) return "consumer_stalled";
	if (backpressured) return "consumer_backpressured";
	return "healthy";
}

module.exports = {
	DEFAULT_CONSUMER_STALE_MS,
	bounded: Values.bounded,
	executionStages: Values.executionStages,
	executorSaturated: Values.executorSaturated,
	executorSummary: Values.executorSummary,
	healthState,
	inspect,
	nonnegative: Values.nonnegative,
	staleIdleLanes: Values.staleIdleLanes
};
