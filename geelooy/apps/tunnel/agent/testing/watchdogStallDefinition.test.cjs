//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Policy = require("../lib/connection-vessel/parent-consumer-recovery-policy.js");
const Recovery = require("../lib/connection-vessel/parent-consumer-recovery.js");
const Decide = require("../lib/connection-vessel/parent-watchdog-consumer-decision.js");

/**
 * @file Proves idle !== stalled: stall repair requires positive evidence of stuck work.
 * @description
 * Item W2 (stall definition): execution_ingress_stalled once fired while the websocket
 * was connected and the system was merely idle. The stall predicate now requires
 * POSITIVE evidence of stuck work — admitted commands with no progress, a busy worker,
 * queued depth, unowned ingress, orphaned custody, or a growing queue — before
 * CHILD_REPLACE may be authorized. Idle + connected never triggers repair; genuine
 * stuck work still does.
 */

const IDENTITY = {
	parentPid: 4242,
	generation: 3,
	processGroupId: 4242,
	birthToken: "stall-definition-test-birth",
	platform: "darwin"
};

/** Idle system on a connected transport: stalled flags set, zero work anywhere. */
function idleExecution(overrides = {}) {
	return {
		websocketState: "connected",
		candidateMode: "owning",
		consumerStalled: true,
		ingressStalled: true,
		stageStalled: false,
		orphanStalled: false,
		stalledLanes: [],
		recentSuccess: false,
		repairing: false,
		unresolved: 0,
		durableUnresolved: 0,
		trackedExecution: 0,
		queued: 0,
		inflight: 0,
		unownedIngress: 0,
		orphanedCustodyCount: 0,
		preConsumerStallCount: 0,
		preConsumerStalledIds: [],
		...overrides
	};
}

function evidence(execution) {
	return { registered: true, execution, pressure: {}, repairIdentity: IDENTITY };
}

/** Real recovery + decision chain with a controllable clock. */
function clockedHarness() {
	let nowMs = 2_000_000;
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "watchdog-stall-"));
	const recovery = Recovery.create({
		now: () => nowMs,
		sustainMs: 1000,
		minimumObservations: 2,
		ledgerOptions: { file: path.join(root, "ledger.json"), now: () => nowMs }
	});
	return {
		recovery,
		tick(ms) { nowMs += ms; },
		decide(ev) {
			return Decide.decide({
				inspection: {},
				execution: ev.execution,
				pressure: ev.pressure,
				registered: ev.registered,
				consumerRecovery: recovery,
				repairIdentity: ev.repairIdentity
			});
		}
	};
}

test("idle + connected websocket never triggers repair", () => {
	const verdict = Policy.classify(evidence(idleExecution()));
	assert.equal(verdict.eligible, false);
	assert.equal(verdict.reason, "stall_no_stuck_work");
});

test("idle stays refused across repeated observations (no slow drift into repair)", () => {
	const ev = evidence(idleExecution());
	for (let i = 0; i < 12; i += 1) {
		const verdict = Policy.classify(ev);
		assert.equal(verdict.eligible, false);
		assert.equal(verdict.reason, "stall_no_stuck_work");
	}
});

test("idle + connected never reaches repair through observe + decide", () => {
	const harness = clockedHarness();
	const ev = evidence(idleExecution());
	for (let i = 0; i < 8; i += 1) {
		harness.tick(1500);
		const decision = harness.decide(ev);
		assert.equal(decision.repairRequired, false);
		assert.equal(decision.repairCandidate, false);
		assert.equal(decision.consumerRecovery.repairAuthorized, false);
	}
});

test("stuck work: admitted commands with no progress still triggers ingress repair", () => {
	const verdict = Policy.classify(evidence(idleExecution({
		unresolved: 3,
		durableUnresolved: 2
	})));
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_ingress_stalled");
});

test("stuck work: worker inflight with no success still triggers repair", () => {
	const verdict = Policy.classify(evidence(idleExecution({
		stageStalled: true,
		inflight: 4
	})));
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_consumer_stalled");
});

test("stuck work: growing queue over consecutive samples still triggers repair", () => {
	const verdict = Policy.classify(evidence(idleExecution({
		queued: 9,
		queueDepthHistory: [2, 5, 9]
	})));
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_ingress_stalled");
});

test("stuck work: stale unowned ingress still triggers repair", () => {
	const verdict = Policy.classify(evidence(idleExecution({ unownedIngress: 2 })));
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_ingress_stalled");
});

test("stuck work: orphaned custody still triggers repair", () => {
	const verdict = Policy.classify(evidence(idleExecution({
		orphanStalled: true,
		orphanedCustodyCount: 6
	})));
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_consumer_stalled");
});

test("queued depth alone is stuck-work evidence even with a flat history", () => {
	const verdict = Policy.classify(evidence(idleExecution({
		queued: 4,
		queueDepthHistory: [4, 4, 4]
	})));
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_ingress_stalled");
});

test("shrinking queue history without other work is not stuck work", () => {
	const verdict = Policy.classify(evidence(idleExecution({
		queueDepthHistory: [9, 5, 2]
	})));
	assert.equal(verdict.eligible, false);
	assert.equal(verdict.reason, "stall_no_stuck_work");
});

test("queueDepthGrowing helper: strict growth only", () => {
	assert.equal(Policy.queueDepthGrowing({ queueDepthHistory: [1, 2, 3] }), true);
	assert.equal(Policy.queueDepthGrowing({ queueDepthHistory: [3, 2, 1] }), false);
	assert.equal(Policy.queueDepthGrowing({ queueDepthHistory: [2, 2] }), false);
	assert.equal(Policy.queueDepthGrowing({ queueDepthHistory: [5] }), false);
	assert.equal(Policy.queueDepthGrowing({}), false);
	assert.equal(Policy.queueDepthGrowing({ queueDepthHistory: ["a", "b"] }), false);
});

test("stuckWorkEvidence helper: any single positive signal counts", () => {
	assert.equal(Policy.stuckWorkEvidence({ unresolved: 1 }), true);
	assert.equal(Policy.stuckWorkEvidence({ queued: 1 }), true);
	assert.equal(Policy.stuckWorkEvidence({ inflight: 1 }), true);
	assert.equal(Policy.stuckWorkEvidence({ unownedIngress: 1 }), true);
	assert.equal(Policy.stuckWorkEvidence({ orphanedCustodyCount: 1 }), true);
	assert.equal(Policy.stuckWorkEvidence({ preConsumerStallCount: 1 }), true);
	assert.equal(Policy.stuckWorkEvidence({ preConsumerStalledIds: ["x"] }), true);
	assert.equal(Policy.stuckWorkEvidence({ queueDepthHistory: [1, 2] }), true);
	assert.equal(Policy.stuckWorkEvidence({}), false);
	assert.equal(Policy.stuckWorkEvidence({
		unresolved: 0, queued: 0, inflight: 0, unownedIngress: 0,
		orphanedCustodyCount: 0, preConsumerStallCount: 0, preConsumerStalledIds: []
	}), false);
});

test("end-to-end: genuine stuck work still earns a durable repair claim", () => {
	const harness = clockedHarness();
	const ev = evidence(idleExecution({ unresolved: 3 }));
	let authorized = false;
	for (let i = 0; i < 8; i += 1) {
		harness.tick(1500);
		const decision = harness.decide(ev);
		if (decision.repairRequired === true) {
			authorized = true;
			assert.equal(decision.repairReason, "execution_ingress_stalled");
			assert.equal(decision.repairClaim?.allowed, true);
			assert.ok(decision.repairClaim?.identity);
			break;
		}
	}
	assert.equal(authorized, true);
});
