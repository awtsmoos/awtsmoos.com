// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the scheduler-witness lane adapter judges wedged in-flight
 * lanes from existing scheduler numbers with zero false alarms.
 */
const assert = require("node:assert/strict");
const LaneTelemetry = require("./parent-consumer-lane-telemetry.js");

const NOW = 1789880000000;
const LANE = "p1_fs_light";
const BOUND = LaneTelemetry.DEFAULT_LANE_BOUNDS_MS[LANE];

function laneStats(overrides = {}) {
	return {
		[LANE]: { inflight: 0, queued: 0, oldestQueuedAgeMs: 0, advisoryTimeoutMs: 1800000 },
		...overrides
	};
}

function interpret(lanes, custodyCount) {
	return LaneTelemetry.interpret({
		childTelemetry: { schedulerLaneStats: lanes },
		parentCustody: { count: custodyCount, records: [] },
		now: NOW
	});
}

function verdictOf(result, lane = LANE) {
	return result.lanes.find((item) => item.lane === lane).verdict;
}

// B"H idle: nothing in flight, nothing queued, custody clear.
{
	const result = interpret(laneStats(), 0);
	assert.equal(verdictOf(result), "idle");
	assert.equal(result.telemetryPresent, true);
	assert.equal(result.telemetryStale, false);
}

// B"H busy: in-flight work with a young queue head stays busy.
{
	const lanes = laneStats({
		[LANE]: { inflight: 3, queued: 1, oldestQueuedAgeMs: 5000, advisoryTimeoutMs: 1800000 }
	});
	const result = interpret(lanes, 2);
	assert.equal(verdictOf(result), "busy");
}

// B"H stalled: wedged in-flight (queue head older than the lane bound) with
// open custody earns stalled - the dual witness agrees.
{
	const lanes = laneStats({
		[LANE]: { inflight: 2, queued: 4, oldestQueuedAgeMs: BOUND + 1000, advisoryTimeoutMs: 1800000 }
	});
	const result = interpret(lanes, 3);
	const item = result.lanes.find((x) => x.lane === LANE);
	assert.equal(item.verdict, "stalled");
	assert.equal(item.evidence.reason, "stalled_wedged_inflight_custody_open");
	assert.equal(item.evidence.witness, "scheduler_lane_stats");
}

// B"H no false alarm: scheduler suspicious but custody clear stays unknown.
{
	const lanes = laneStats({
		[LANE]: { inflight: 2, queued: 4, oldestQueuedAgeMs: BOUND + 1000, advisoryTimeoutMs: 1800000 }
	});
	const result = interpret(lanes, 0);
	assert.equal(verdictOf(result), "unknown");
}

// B"H queued-only backlog (nothing in flight) is not a wedged lane here;
// the existing stale-idle logic owns that case.
{
	const lanes = laneStats({
		[LANE]: { inflight: 0, queued: 9, oldestQueuedAgeMs: BOUND + 1000, advisoryTimeoutMs: 1800000 }
	});
	const result = interpret(lanes, 5);
	assert.equal(verdictOf(result), "unknown");
}

// B"H drained lane with open custody is unknown, never idle.
{
	const result = interpret(laneStats(), 4);
	assert.equal(verdictOf(result), "unknown");
}

// B"H live advisoryTimeoutMs is honored as the lane bound.
{
	const lanes = laneStats({
		[LANE]: { inflight: 1, queued: 1, oldestQueuedAgeMs: 6000, advisoryTimeoutMs: 5000 }
	});
	const result = LaneTelemetry.interpret({
		childTelemetry: { schedulerLaneStats: lanes },
		parentCustody: { count: 1, records: [] },
		now: NOW,
		laneBounds: { [LANE]: 5000 }
	});
	assert.equal(verdictOf(result), "stalled");
}

// B"H the child's own laneDataPath keeps precedence when both are present.
{
	const childEntry = (overrides) => ({
		started: 10, completed: 2,
		oldestInFlightAgeMs: 1000, lastProgressAt: NOW - 100,
		lastDrainAt: 0, wedgedEvictions: 0, ...overrides
	});
	const lanes = {};
	for (const lane of LaneTelemetry.LANE_ORDER) lanes[lane] = childEntry();
	const result = LaneTelemetry.interpret({
		childTelemetry: {
			observedAt: NOW,
			lanes,
			schedulerLaneStats: laneStats({
				[LANE]: { inflight: 9, oldestQueuedAgeMs: BOUND + 5000, advisoryTimeoutMs: 1800000 }
			})
		},
		parentCustody: { count: 3, records: [] },
		now: NOW
	});
	// Child telemetry says busy (young in-flight, recent progress) - it wins.
	assert.equal(verdictOf(result), "busy");
}

// B"H missing scheduler stats degrade to unknown, never stalled.
{
	const result = LaneTelemetry.interpret({
		childTelemetry: { schedulerLaneStats: null },
		parentCustody: { count: 9, records: [] },
		now: NOW
	});
	for (const item of result.lanes) assert.equal(item.verdict, "unknown");
	assert.equal(result.telemetryPresent, false);
}

// B"H adapter bounds and sanitizes hostile input without throwing.
{
	assert.equal(LaneTelemetry.laneStatsToTelemetry(null), null);
	assert.equal(LaneTelemetry.laneStatsToTelemetry("nope"), null);
	assert.equal(LaneTelemetry.laneStatsToTelemetry({}), null);
	const adapted = LaneTelemetry.laneStatsToTelemetry({
		[LANE]: { inflight: -4, oldestQueuedAgeMs: "old" }
	}, NOW);
	assert.equal(adapted, null);
	const adapted2 = LaneTelemetry.laneStatsToTelemetry(laneStats(), NOW);
	assert.equal(adapted2.observedAt, NOW);
	assert.equal(adapted2.lanes[LANE].inflight, 0);
	assert.equal(adapted2.lanes[LANE].schedulerWitness, true);
}

console.log("BHY scheduler lane witness judges wedged in-flight lanes with zero false alarms");
