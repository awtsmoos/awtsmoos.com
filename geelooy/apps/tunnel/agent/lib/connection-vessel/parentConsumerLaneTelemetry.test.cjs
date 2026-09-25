// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const LaneTelemetry = require("./parent-consumer-lane-telemetry.js");
const SettlementPulse = require("./child-outbox-settlement-pulse.js");
const ConsumerHealth = require("./parent-consumer-health.js");

/**
 * @file Proves per-lane data-path stall verdicts need both witnesses to agree.
 * @description
 * The Awtsmoos never condemns a lane on one testimony; Awtsmoos.com therefore proves
 * that a stall verdict requires the child's own lane telemetry AND open parent custody
 * together, that missing, partial, or stale telemetry always yields unknown, and that
 * the new evidence fields never move the existing healthy/consumerStalled judgment.
 */

const NOW = 1789881045000;
const BOUND_P0 = LaneTelemetry.DEFAULT_LANE_BOUNDS_MS.p0_control; // 300000
const BOUND_P1 = LaneTelemetry.DEFAULT_LANE_BOUNDS_MS.p1_fs_light; // 1800000

proveIdleLane();
proveBusyLaneRecentProgress();
proveBusyLaneYoungInflight();
proveStalledLaneBothWitnessesAgree();
proveChildSuspiciousCustodyClearNeverStalled();
proveMissingTelemetryAlwaysUnknown();
provePartialTelemetryAlwaysUnknown();
proveStaleTelemetryAlwaysUnknown();
proveExtractFromStats();
provePulseCarriesLaneDataPath();
provePulseWithoutProviderStaysNull();
provePulseSanitizesProviderTelemetry();
proveHealthAppendsDataPathEvidence();
proveHealthWithoutTelemetryStaysEmpty();
proveHealthNeverFlipsExistingDecision();
console.log("BHY lane data-path verdicts need both witnesses and never cry stalled alone");

function laneEntry(overrides = {}) {
	return {
		started: 0,
		completed: 0,
		oldestInFlightAgeMs: 0,
		lastProgressAt: 0,
		lastDrainAt: 0,
		wedgedEvictions: 0,
		...overrides
	};
}

function telemetryFor(lane, entry, observedAt = NOW) {
	return { observedAt, lanes: { [lane]: laneEntry(entry) } };
}

function verdictOf(result, lane) {
	const found = result.lanes.find((item) => item.lane === lane);
	assert.ok(found, `expected lane ${lane} in interpretation`);
	return found;
}

function proveIdleLane() {
	const result = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p1_fs_light",
			{ started: 5, completed: 5, lastProgressAt: NOW - 1000, lastDrainAt: NOW - 1000 }),
		parentCustody: { count: 0, records: [] },
		now: NOW
	});
	assert.equal(verdictOf(result, "p1_fs_light").verdict, "idle");
}

function proveBusyLaneRecentProgress() {
	const result = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p1_fs_light",
			{ started: 7, completed: 5, oldestInFlightAgeMs: 10000, lastProgressAt: NOW - 5000 }),
		parentCustody: { count: 3, records: [] },
		now: NOW
	});
	const lane = verdictOf(result, "p1_fs_light");
	assert.equal(lane.verdict, "busy");
	assert.equal(lane.evidence.reason, "busy_recent_progress");
	assert.equal(lane.evidence.inFlight, 2);
}

function proveBusyLaneYoungInflight() {
	// No progress for longer than the bound, but the oldest in-flight work is young.
	const result = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p1_fs_light",
			{ started: 4, completed: 3, oldestInFlightAgeMs: 60000, lastProgressAt: NOW - 2000000 }),
		parentCustody: { count: 1, records: [] },
		now: NOW
	});
	const lane = verdictOf(result, "p1_fs_light");
	assert.equal(lane.verdict, "busy");
	assert.equal(lane.evidence.reason, "busy_inflight_within_bound");
}

function proveStalledLaneBothWitnessesAgree() {
	const result = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p0_control",
			{ started: 3, completed: 1, oldestInFlightAgeMs: BOUND_P0 + 100000,
				lastProgressAt: NOW - (BOUND_P0 + 100000) }),
		parentCustody: { count: 2, records: [{}, {}] },
		now: NOW
	});
	const lane = verdictOf(result, "p0_control");
	assert.equal(lane.verdict, "stalled");
	assert.equal(lane.evidence.reason, "stalled_old_inflight_no_progress_custody_open");
	assert.equal(lane.evidence.custodyUnresolved, 2);
	// At-or-beyond the bound counts as beyond.
	const boundary = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p0_control",
			{ started: 2, completed: 1, oldestInFlightAgeMs: BOUND_P0,
				lastProgressAt: NOW - BOUND_P0 }),
		parentCustody: { count: 1, records: [{}] },
		now: NOW
	});
	assert.equal(verdictOf(boundary, "p0_control").verdict, "stalled");
}

function proveChildSuspiciousCustodyClearNeverStalled() {
	const result = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p0_control",
			{ started: 3, completed: 1, oldestInFlightAgeMs: BOUND_P0 + 100000,
				lastProgressAt: NOW - (BOUND_P0 + 100000) }),
		parentCustody: { count: 0, records: [] },
		now: NOW
	});
	const lane = verdictOf(result, "p0_control");
	assert.notEqual(lane.verdict, "stalled");
	assert.equal(lane.verdict, "unknown");
	assert.equal(lane.evidence.reason, "child_suspicious_custody_clear");
	assert.ok(!result.lanes.some((item) => item.verdict === "stalled"));
}

function proveMissingTelemetryAlwaysUnknown() {
	for (const childTelemetry of [null, undefined, {}, { lanes: null }]) {
		const result = LaneTelemetry.interpret({
			childTelemetry,
			parentCustody: { count: 9, records: [] },
			now: NOW
		});
		assert.equal(result.telemetryPresent, false);
		assert.ok(result.lanes.length > 0);
		for (const lane of result.lanes) assert.equal(lane.verdict, "unknown");
		assert.ok(!result.lanes.some((item) => item.verdict === "stalled"));
	}
	// The carrier arrived but carried no lane entries: present, yet every lane unknown.
	const empty = LaneTelemetry.interpret({
		childTelemetry: { lanes: {} },
		parentCustody: { count: 9, records: [] },
		now: NOW
	});
	assert.equal(empty.telemetryPresent, true);
	for (const lane of empty.lanes) {
		assert.equal(lane.verdict, "unknown");
		assert.equal(lane.evidence.reason, "telemetry_partial");
	}
}

function provePartialTelemetryAlwaysUnknown() {
	// Lane entry present but missing required numeric fields.
	const partial = LaneTelemetry.interpret({
		childTelemetry: { observedAt: NOW, lanes: { p0_control: { started: 4 } } },
		parentCustody: { count: 4, records: [] },
		now: NOW
	});
	const lane = verdictOf(partial, "p0_control");
	assert.equal(lane.verdict, "unknown");
	assert.equal(lane.evidence.reason, "telemetry_partial");
	// Lane key absent entirely while a sibling lane is complete.
	const absent = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p1_fs_light",
			{ started: 1, completed: 1, lastProgressAt: NOW - 10 }),
		parentCustody: { count: 0, records: [] },
		now: NOW
	});
	assert.equal(verdictOf(absent, "p0_control").verdict, "unknown");
	assert.equal(verdictOf(absent, "p1_fs_light").verdict, "idle");
}

function proveStaleTelemetryAlwaysUnknown() {
	const cadence = LaneTelemetry.DEFAULT_PULSE_CADENCE_MS;
	const staleAt = NOW - (LaneTelemetry.STALE_AFTER_CADENCES * cadence) - 1;
	const result = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p0_control",
			{ started: 3, completed: 1, oldestInFlightAgeMs: BOUND_P0 + 100000,
				lastProgressAt: staleAt - BOUND_P0 },
			staleAt),
		parentCustody: { count: 2, records: [] },
		now: NOW
	});
	assert.equal(result.telemetryPresent, true);
	assert.equal(result.telemetryStale, true);
	for (const lane of result.lanes) {
		assert.equal(lane.verdict, "unknown");
		assert.equal(lane.evidence.reason, "telemetry_stale");
	}
	// Exactly at the stale boundary is still fresh enough to judge.
	const fresh = LaneTelemetry.interpret({
		childTelemetry: telemetryFor("p0_control",
			{ started: 3, completed: 1, oldestInFlightAgeMs: BOUND_P0 + 100000,
				lastProgressAt: NOW - BOUND_P0 - 5000 },
			NOW - LaneTelemetry.STALE_AFTER_CADENCES * cadence),
		parentCustody: { count: 2, records: [] },
		now: NOW
	});
	assert.equal(fresh.telemetryStale, false);
	assert.equal(verdictOf(fresh, "p0_control").verdict, "stalled");
}

function proveExtractFromStats() {
	const telemetry = telemetryFor("p0_control", { started: 1, completed: 1 });
	assert.equal(
		LaneTelemetry.extractFromStats({ outboxSettlement: { laneDataPath: telemetry } }),
		telemetry
	);
	assert.equal(LaneTelemetry.extractFromStats({ laneDataPath: telemetry }), telemetry);
	assert.equal(LaneTelemetry.extractFromStats({}), null);
	assert.equal(LaneTelemetry.extractFromStats({ outboxSettlement: {} }), null);
	assert.equal(LaneTelemetry.extractFromStats(null), null);
}

function createPulse(options = {}) {
	return SettlementPulse.create({
		delivery: { flush: () => 0 },
		mailbox: { outbox: () => [] },
		state: { registrationConfirmed: true },
		now: () => NOW,
		...options
	});
}

function provePulseCarriesLaneDataPath() {
	const provided = telemetryFor("p2_chrome_light",
		{ started: 9, completed: 4, oldestInFlightAgeMs: 120000,
			lastProgressAt: NOW - 30000, lastDrainAt: NOW - 60000, wedgedEvictions: 2 });
	const pulse = createPulse({ laneDataPath: () => provided });
	const witness = pulse.tick(0);
	assert.ok(witness.laneDataPath, "expected laneDataPath on the pulse snapshot");
	assert.equal(witness.laneDataPath.observedAt, NOW);
	const lane = witness.laneDataPath.lanes.p2_chrome_light;
	assert.equal(lane.started, 9);
	assert.equal(lane.completed, 4);
	assert.equal(lane.oldestInFlightAgeMs, 120000);
	assert.equal(lane.wedgedEvictions, 2);
}

function provePulseWithoutProviderStaysNull() {
	const pulse = createPulse();
	const witness = pulse.tick(0);
	assert.equal(witness.laneDataPath, null);
	assert.equal(witness.reason, "outbox_empty");
}

function provePulseSanitizesProviderTelemetry() {
	const throwing = createPulse({
		laneDataPath: () => { throw new Error("boom"); }
	});
	assert.equal(throwing.tick(0).laneDataPath, null);
	const messy = createPulse({
		laneDataPath: {
			observedAt: NOW,
			lanes: {
				p1_fs_light: { started: -3, completed: 2.9, oldestInFlightAgeMs: "nope",
					lastProgressAt: NOW - 10, lastDrainAt: null, wedgedEvictions: 1 },
				not_a_lane: { started: 100, completed: 0 }
			}
		}
	});
	const witness = messy.tick(0);
	const lane = witness.laneDataPath.lanes.p1_fs_light;
	assert.equal(lane.started, 0);
	assert.equal(lane.completed, 2);
	assert.equal(lane.oldestInFlightAgeMs, null);
	assert.equal(witness.laneDataPath.lanes.not_a_lane, undefined);
}

function proveHealthAppendsDataPathEvidence() {
	const stats = {
		outboxSettlement: {
			laneDataPath: telemetryFor("p0_control",
				{ started: 3, completed: 1, oldestInFlightAgeMs: BOUND_P0 + 100000,
					lastProgressAt: NOW - (BOUND_P0 + 100000) })
		}
	};
	const mailbox = {
		inbox: {
			parentCustodyCount: 1,
			parentCustodyOldestAgeMs: 1000,
			parentCustodyRecords: [
				{ id: "r1", phase: "running", acceptedAt: NOW - 1000,
					lastProgressAt: NOW - 500, phaseStartedAt: NOW - 1000 }
			]
		}
	};
	const result = ConsumerHealth.inspect(stats, mailbox, { now: () => NOW });
	assert.deepEqual(result.dataPathStalledLanes, ["p0_control"]);
	assert.equal(result.dataPathTelemetry.telemetryPresent, true);
	assert.equal(result.dataPathTelemetry.telemetryStale, false);
	const lane = result.dataPathTelemetry.lanes.find((item) => item.lane === "p0_control");
	assert.equal(lane.verdict, "stalled");
}

function proveHealthWithoutTelemetryStaysEmpty() {
	const result = ConsumerHealth.inspect({}, {}, { now: () => NOW });
	assert.deepEqual(result.dataPathStalledLanes, []);
	assert.equal(result.dataPathTelemetry.telemetryPresent, false);
	assert.ok(result.dataPathTelemetry.lanes.every((item) => item.verdict === "unknown"));
}

function proveHealthNeverFlipsExistingDecision() {
	// The same stalled-evidence input as proveHealthAppendsDataPathEvidence: the new
	// fields report the stall, but healthy/consumerStalled stay exactly as before.
	const stats = {
		outboxSettlement: {
			laneDataPath: telemetryFor("p0_control",
				{ started: 3, completed: 1, oldestInFlightAgeMs: BOUND_P0 + 100000,
					lastProgressAt: NOW - (BOUND_P0 + 100000) })
		}
	};
	const mailbox = {
		inbox: {
			parentCustodyCount: 1,
			parentCustodyOldestAgeMs: 1000,
			parentCustodyRecords: [
				{ id: "r1", phase: "running", acceptedAt: NOW - 1000,
					lastProgressAt: NOW - 500, phaseStartedAt: NOW - 1000 }
			]
		}
	};
	const result = ConsumerHealth.inspect(stats, mailbox, { now: () => NOW });
	assert.deepEqual(result.dataPathStalledLanes, ["p0_control"]);
	assert.equal(result.healthy, true);
	assert.equal(result.consumerStalled, false);
	assert.equal(result.state, "healthy");
}
