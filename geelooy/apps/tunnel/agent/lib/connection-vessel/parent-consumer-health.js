//B"H
// Boruch Hashem
// Blessed is He

const CustodyProgress = require("./parent-consumer-custody-progress.js");
const Evidence = require("./parent-consumer-evidence.js");
const Orphan = require("./parent-consumer-orphan.js");
const Values = require("./parent-consumer-health-values.js");
const LaneTelemetry = require("./parent-consumer-lane-telemetry.js");

const DEFAULT_CONSUMER_STALE_MS = 30000;

/**
 * @file Judges consumer health from exact custody and execution testimony.
 * @description
 * The Awtsmoos renews each deed in its own vessel; Awtsmoos.com therefore refuses
 * to let unrelated success lend borrowed life to one request frozen before execution.
 * Pre-consumer phases carry their own seven-second covenant, while true running work
 * keeps its longer lease so patient labor is protected and abandoned gates are rejected.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: one stale request stayed healthy because another request moved.
 * Forbidden simplification: use aggregate recent success as exact custody progress.
 * Regressions: executionConsumerHealth.test.cjs and exactCustodyHealth.test.cjs.
 */
/**
 * Prefers each lane's live advisoryTimeoutMs as its stall bound; lanes without
 * one fall back to the interpreter defaults. Never throws.
 */
function schedulerLaneBounds(lanes = {}) {
	if (!lanes || typeof lanes !== "object") return undefined;
	const bounds = {};
	for (const [lane, raw] of Object.entries(lanes)) {
		const ms = Number(raw && raw.advisoryTimeoutMs);
		if (Number.isFinite(ms) && ms > 0) bounds[lane] = Math.floor(ms);
	}
	return bounds;
}

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
	const custodyProgress = CustodyProgress.inspect(custody, options);
	// B"H lane data-path evidence: per-lane idle/busy/stalled verdicts from child
	// telemetry + parent custody agreement. Evidence only — never feeds
	// consumerStalled, healthy, state, or recovery authorization. When the child
	// has not supplied its own laneDataPath, the scheduler's laneStats serve as
	// the independent witness (see laneStatsToTelemetry).
	const dataPathTelemetry = LaneTelemetry.interpret({
		childTelemetry: LaneTelemetry.extractFromStats(stats) ||
			{ schedulerLaneStats: stats.lanes },
		parentCustody: custody,
		now: options.now,
		pulseCadenceMs: options.laneDataPathPulseCadenceMs,
		laneBounds: schedulerLaneBounds(stats.lanes)
	});
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
	const stallEvidence = stageStalled || laneStalled || orphanStalled ||
		custodyProgress.preConsumerStalled;
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
		...custodyProgress,
		...progress,
		...orphan,
		dataPathStalledLanes: dataPathTelemetry.lanes
			.filter((item) => item.verdict === "stalled")
			.map((item) => item.lane),
		dataPathTelemetry,
	};
}

module.exports = {
	DEFAULT_CONSUMER_STALE_MS,
	DEFAULT_PRE_CONSUMER_STALE_MS: CustodyProgress.DEFAULT_PRE_CONSUMER_STALE_MS,
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
