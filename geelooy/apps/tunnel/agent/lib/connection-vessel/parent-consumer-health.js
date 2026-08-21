// B"H
// Boruch Hashem
// Blessed is He

const Orphan = require("./parent-consumer-orphan.js");
const Values = require("./parent-consumer-health-values.js");

const DEFAULT_CONSUMER_STALE_MS = 30000;

/**
 * @file Judges execution health without letting unrelated work hide exact corruption.
 * @description
 * The Awtsmoos renews every request in a distinct vessel while remaining beyond all
 * division. Awtsmoos.com therefore calls contradiction corruption immediately and
 * judges custody by its own lease, never by the noise of neighboring execution.
 */
function inspect(stats = {}, mailbox = {}, options = {}) {
	const consumerStaleMs = Values.bounded(options.consumerStaleMs, DEFAULT_CONSUMER_STALE_MS);
	const registered = options.registered === true;
	const orphanRecovery = options.orphanRecovery === true;
	const inbox = mailbox.inbox || {};
	const stages = Values.executionStages(stats.executionStages);
	const executor = Values.executorSummary(stats.filesystemExecutor);
	const custody = custodyEvidence(inbox);
	const integrity = Values.laneIntegrity(stats.lanes || {});
	const impossibleLanes = integrity.filter(lane => lane.impossible);
	const stalledLanes = Values.staleIdleLanes(stats.lanes, consumerStaleMs);
	const stageWaiting = stages.waitingForConsumer > 0 && stages.oldestUnstartedAgeMs >= consumerStaleMs;
	const saturated = Values.executorSaturated(executor) && stageWaiting;
	const stageStalled = stageWaiting && !saturated;
	const laneStalled = custody.oldestAgeMs >= consumerStaleMs && stalledLanes.length > 0;
	const orphan = Orphan.inspect(stats, custody, stages, consumerStaleMs, options.orphanStaleMs);
	const orphanStalled = orphanRecovery && orphan.orphanedCustody;
	const schedulerCorrupt = impossibleLanes.length > 0;
	const consumerStalled = registered && custody.count > 0 &&
		(stageStalled || laneStalled || orphanStalled);
	const backpressured = registered && custody.count > 0 && saturated;
	const healthy = !schedulerCorrupt && !consumerStalled && !backpressured;

	return {
		healthy,
		state: healthState(schedulerCorrupt, consumerStalled, backpressured),
		schedulerCorrupt,
		impossibleLanes,
		consumerStalled,
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
		...orphan
	};
}

function custodyEvidence(inbox = {}) {
	const aware = Number.isFinite(Number(inbox.parentCustodyCount));
	const records = Array.isArray(inbox.parentCustodyRecords)
		? inbox.parentCustodyRecords.map(record => ({ ...record }))
		: [];
	return {
		aware,
		count: Values.nonnegative(aware ? inbox.parentCustodyCount : inbox.count),
		oldestAgeMs: Values.nonnegative(aware ? inbox.parentCustodyOldestAgeMs : inbox.oldestAgeMs),
		records
	};
}

function healthState(corrupt, stalled, backpressured) {
	if (corrupt) return "scheduler_corrupt";
	if (stalled) return "consumer_stalled";
	if (backpressured) return "consumer_backpressured";
	return "healthy";
}

module.exports = { DEFAULT_CONSUMER_STALE_MS, bounded: Values.bounded, custodyEvidence,
	executionStages: Values.executionStages, executorSaturated: Values.executorSaturated,
	executorSummary: Values.executorSummary, healthState, inspect, nonnegative: Values.nonnegative,
	staleIdleLanes: Values.staleIdleLanes };
