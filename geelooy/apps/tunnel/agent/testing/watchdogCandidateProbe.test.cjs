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
 * @file Proves a candidate-probe's expected reduced ingress never becomes a production stall.
 * @description
 * Item W2 (candidate-probe): during candidate validation the connection child runs with
 * candidateMode "candidate-probe" — deliberately limited, non-owning ingress. The watchdog
 * once classified that expected quiet as execution_ingress_stalled and SIGTERMed the child
 * mid-validation. These tests prove the stall classifier is now gated on the mode: a
 * candidate-probe runtime with only probe-level ingress never triggers repair, no matter
 * how long the watchdog watches.
 */

const IDENTITY = {
	parentPid: 4242,
	generation: 3,
	processGroupId: 4242,
	birthToken: "candidate-probe-test-birth",
	platform: "darwin"
};

/** Probe-level ingress: stalled flags the old classifier trusted, zero stuck work. */
function probeExecution(overrides = {}) {
	return {
		candidateMode: "candidate-probe",
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

function probeEvidence(execution) {
	return { registered: true, execution, pressure: {}, repairIdentity: IDENTITY };
}

/** Real recovery + decision chain with a controllable clock. */
function clockedHarness() {
	let nowMs = 1_000_000;
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "watchdog-probe-"));
	const recovery = Recovery.create({
		now: () => nowMs,
		sustainMs: 1000,
		minimumObservations: 2,
		ledgerOptions: { file: path.join(root, "ledger.json"), now: () => nowMs }
	});
	return {
		recovery,
		tick(ms) { nowMs += ms; },
		decide(evidence) {
			return Decide.decide({
				inspection: {},
				execution: evidence.execution,
				pressure: evidence.pressure,
				registered: evidence.registered,
				consumerRecovery: recovery,
				repairIdentity: evidence.repairIdentity
			});
		}
	};
}

test("candidate-probe with only probe-level ingress never classifies as a stall", () => {
	const verdict = Policy.classify(probeEvidence(probeExecution()));
	assert.equal(verdict.eligible, false);
	assert.equal(verdict.reason, "candidate_probe_exempt");
});

test("candidate-probe stays exempt across a full watchdog observation loop", () => {
	const evidence = probeEvidence(probeExecution());
	for (let i = 0; i < 12; i += 1) {
		const verdict = Policy.classify(evidence);
		assert.equal(verdict.eligible, false);
		assert.equal(verdict.reason, "candidate_probe_exempt");
	}
});

test("candidate-probe exemption is absolute: even apparent stuck work cannot trigger repair mid-validation", () => {
	const verdict = Policy.classify(probeEvidence(probeExecution({
		unresolved: 5,
		queued: 3,
		inflight: 2
	})));
	assert.equal(verdict.eligible, false);
	assert.equal(verdict.reason, "candidate_probe_exempt");
});

test("same stalled flags without probe mode are NOT exempt (idle is refused as idle, not as probe)", () => {
	const execution = probeExecution({ candidateMode: "owning" });
	const verdict = Policy.classify(probeEvidence(execution));
	assert.equal(verdict.eligible, false);
	assert.notEqual(verdict.reason, "candidate_probe_exempt");
	assert.equal(verdict.reason, "stall_no_stuck_work");
});

test("transport-level parent-unresponsive still classifies in probe mode (only the stall classifier is gated)", () => {
	const verdict = Policy.classify({
		registered: true,
		execution: probeExecution(),
		pressure: {},
		parentUnresponsive: true,
		repairIdentity: IDENTITY
	});
	assert.equal(verdict.eligible, true);
	assert.equal(verdict.reason, "execution_parent_unresponsive");
});

test("end-to-end: probe validation never reaches repair through observe + decide", () => {
	const harness = clockedHarness();
	const evidence = probeEvidence(probeExecution());
	for (let i = 0; i < 8; i += 1) {
		harness.tick(1500);
		const decision = harness.decide(evidence);
		assert.equal(decision.repairRequired, false);
		assert.equal(decision.repairCandidate, false);
		assert.equal(decision.repairCandidateReason, "");
		assert.equal(decision.consumerRecovery.repairAuthorized, false);
	}
});
