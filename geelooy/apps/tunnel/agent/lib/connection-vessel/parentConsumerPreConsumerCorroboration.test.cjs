//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Corroboration = require("./parent-consumer-pre-consumer-corroboration.js");
const Recovery = require("./parent-consumer-recovery.js");

/**
 * @file Proves a pure pre-consumer stall corroborates itself without false positives.
 * @description
 * The Awtsmoos never lifts the veto on a bare consumerStalled claim; the claim must
 * corroborate ITSELF. Awtsmoos.com therefore demands the same stalled records, owned
 * by the same child incarnation, frozen across repeated observations before Gevurah
 * may even be considered. Any fingerprint or incarnation change restarts the window,
 * so flapping custody can never mature into destructive force, while a genuinely
 * dead consumer still earns repair through the unchanged downstream gates.
 */

const STALE_MS = 7000;
const CHILD_A = "child-incarnation-a";
const CHILD_B = "child-incarnation-b";

proveGenuineSustainedStallBecomesEligible();
proveObservationGateIndependentOfTime();
proveSustainGateIndependentOfCount();
proveSingleObservationNeverEligible();
proveFingerprintChangeRestartsWindow();
proveIncarnationChangeRestartsWindow();
proveIncompleteProofNeverEligible();
proveStaleThresholdEnforced();
provePhaseMustBePreConsumer();
proveMixedIncarnationsRejected();
proveTopLevelIncarnationMustAgree();
proveClearedStallResetsWindow();
proveUnrelatedEvidenceDoesNotDisturbWindow();
proveRecoveryVetoFallbackRepairsGenuineStall();
proveRecoveryKeepsVetoWithoutProof();
console.log("BHY pre-consumer stall corroborates itself with zero false positives");

/** Genuine sustained stall: same 2 ids, complete proof, stable incarnation, 4 obs over 4s. */
function proveGenuineSustainedStallBecomesEligible() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	const acceptedAt = 1000;
	for (const t of [9000, 10000, 11000, 12000]) {
		c.set(t);
		const result = corroboration.observe(stallEvidence(c, ["r-1", "r-2"], acceptedAt));
		assert.equal(result.eligible, false);
		assert.equal(result.reason, "pre_consumer_stall_unproven");
	}
	c.set(13000);
	const matured = corroboration.observe(stallEvidence(c, ["r-1", "r-2"], acceptedAt));
	assert.equal(matured.eligible, true);
	assert.equal(matured.reason, "execution_pre_consumer_stalled");
	assert.equal(matured.observations, 5);
	assert.deepEqual(matured.stalledIds, ["r-1", "r-2"]);
	assert.equal(matured.childIncarnationId, CHILD_A);
}

/** Four observations are required even when the sustain window is already met. */
function proveObservationGateIndependentOfTime() {
	const c = clock();
	const corroboration = Corroboration.create({
		now: c.now,
		minObservations: 4,
		sustainMs: 0
	});
	const acceptedAt = 1000;
	for (const t of [9000, 10000, 11000]) {
		c.set(t);
		assert.equal(corroboration.observe(stallEvidence(c, ["r-1"], acceptedAt)).eligible, false);
	}
	c.set(12000);
	assert.equal(corroboration.observe(stallEvidence(c, ["r-1"], acceptedAt)).eligible, true);
}

/** The sustain window is required even when enough observations arrived quickly. */
function proveSustainGateIndependentOfCount() {
	const c = clock();
	const corroboration = Corroboration.create({
		now: c.now,
		minObservations: 2,
		sustainMs: 4000
	});
	const acceptedAt = 1000;
	for (const t of [9000, 9100, 9200, 9300]) {
		c.set(t);
		assert.equal(corroboration.observe(stallEvidence(c, ["r-1"], acceptedAt)).eligible, false);
	}
	c.set(13000);
	assert.equal(corroboration.observe(stallEvidence(c, ["r-1"], acceptedAt)).eligible, true);
}

/** A single observation can never authorize; no false positive on first sight. */
function proveSingleObservationNeverEligible() {
	const c = clock();
	c.set(9000);
	const corroboration = Corroboration.create({ now: c.now });
	const result = corroboration.observe(stallEvidence(c, ["r-1", "r-2"], 1000));
	assert.equal(result.eligible, false);
	assert.equal(result.reason, "pre_consumer_stall_unproven");
	assert.equal(corroboration.snapshot().observations, 1);
}

/** Fingerprint change mid-window resets the counter: the anti-flap core. */
function proveFingerprintChangeRestartsWindow() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	const acceptedAt = 1000;
	for (const t of [9000, 10000, 11000]) {
		c.set(t);
		corroboration.observe(stallEvidence(c, ["r-1", "r-2"], acceptedAt));
	}
	assert.equal(corroboration.snapshot().observations, 3);
	c.set(12000);
	const changed = corroboration.observe(stallEvidence(c, ["r-1", "r-3"], acceptedAt));
	assert.equal(changed.eligible, false);
	assert.equal(corroboration.snapshot().observations, 1);
	for (const t of [13000, 14000, 15000]) {
		c.set(t);
		assert.equal(corroboration.observe(stallEvidence(c, ["r-1", "r-3"], acceptedAt)).eligible, false);
	}
	c.set(16000);
	assert.equal(corroboration.observe(stallEvidence(c, ["r-1", "r-3"], acceptedAt)).eligible, true);
}

/** Incarnation change mid-window resets: a new child voids old testimony. */
function proveIncarnationChangeRestartsWindow() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	const acceptedAt = 1000;
	for (const t of [9000, 10000, 11000]) {
		c.set(t);
		corroboration.observe(stallEvidence(c, ["r-1", "r-2"], acceptedAt, { childIncarnationId: CHILD_A }));
	}
	assert.equal(corroboration.snapshot().observations, 3);
	c.set(12000);
	const changed = corroboration.observe(
		stallEvidence(c, ["r-1", "r-2"], acceptedAt, { childIncarnationId: CHILD_B })
	);
	assert.equal(changed.eligible, false);
	assert.equal(changed.reason, "pre_consumer_stall_unproven");
	assert.equal(corroboration.snapshot().observations, 1);
	assert.equal(corroboration.snapshot().childIncarnationId, CHILD_B);
}

/** Incomplete proof (missing acceptedAt) can never become eligible. */
function proveIncompleteProofNeverEligible() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	for (const t of [9000, 10000, 11000, 12000, 13000, 14000]) {
		c.set(t);
		const records = ["r-1", "r-2"].map((id) => ({
			id,
			phase: "queued",
			ageMs: t,
			acceptedAt: 0,
			phaseStartedAt: 0,
			lastProgressAt: 0,
			childIncarnationId: CHILD_A
		}));
		const result = corroboration.observe({
			execution: {
				preConsumerStalled: true,
				preConsumerStaleMs: STALE_MS,
				preConsumerStallRecords: records
			}
		});
		assert.equal(result.eligible, false);
		assert.equal(corroboration.snapshot().observations, 0);
	}
}

/** Records younger than the stale threshold prove nothing. */
function proveStaleThresholdEnforced() {
	const c = clock();
	c.set(9000);
	const corroboration = Corroboration.create({ now: c.now });
	const result = corroboration.observe({
		execution: {
			preConsumerStalled: true,
			preConsumerStaleMs: STALE_MS,
			preConsumerStallRecords: [{
				id: "r-young",
				phase: "queued",
				ageMs: STALE_MS - 1,
				acceptedAt: 9000 - (STALE_MS - 1),
				phaseStartedAt: 9000 - (STALE_MS - 1),
				lastProgressAt: 9000 - (STALE_MS - 1),
				childIncarnationId: CHILD_A
			}]
		}
	});
	assert.equal(result.eligible, false);
}

/** Only pre-consumer phases count; running work keeps its longer lease. */
function provePhaseMustBePreConsumer() {
	const c = clock();
	c.set(9000);
	const corroboration = Corroboration.create({ now: c.now });
	for (const phase of ["running", "result_waiting_for_ack", "", "dispatched"]) {
		const result = corroboration.observe({
			execution: {
				preConsumerStalled: true,
				preConsumerStaleMs: STALE_MS,
				preConsumerStallRecords: [{
					id: "r-x",
					phase,
					ageMs: 30000,
					acceptedAt: 1000,
					phaseStartedAt: 1000,
					lastProgressAt: 1000,
					childIncarnationId: CHILD_A
				}]
			}
		});
		assert.equal(result.eligible, false, phase);
	}
	assert.equal(corroboration.snapshot().observations, 0);
}

/** One snapshot mixing two child incarnations is self-contradictory testimony. */
function proveMixedIncarnationsRejected() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	for (const t of [9000, 10000, 11000, 12000, 13000]) {
		c.set(t);
		const evidence = stallEvidence(c, ["r-1", "r-2"], 1000);
		evidence.execution.preConsumerStallRecords[1] = {
			...evidence.execution.preConsumerStallRecords[1],
			childIncarnationId: CHILD_B
		};
		const result = corroboration.observe(evidence);
		assert.equal(result.eligible, false);
	}
	assert.equal(corroboration.snapshot().observations, 0);
}

/** A top-level child incarnation, when present, must agree with the records. */
function proveTopLevelIncarnationMustAgree() {
	const c = clock();
	const disagreeing = Corroboration.create({ now: c.now });
	for (const t of [9000, 10000, 11000, 12000, 13000]) {
		c.set(t);
		const evidence = stallEvidence(c, ["r-1"], 1000);
		evidence.childIncarnationId = CHILD_B;
		assert.equal(disagreeing.observe(evidence).eligible, false);
	}
	const agreeing = Corroboration.create({ now: c.now, minObservations: 2, sustainMs: 0 });
	for (const t of [9000, 10000]) {
		c.set(t);
		const evidence = stallEvidence(c, ["r-1"], 1000);
		evidence.childIncarnationId = CHILD_A;
		agreeing.observe(evidence);
	}
	assert.equal(agreeing.snapshot().eligible, true);
}

/** A cleared stall resets the window; the next stall must prove itself anew. */
function proveClearedStallResetsWindow() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	const acceptedAt = 1000;
	for (const t of [9000, 10000, 11000]) {
		c.set(t);
		corroboration.observe(stallEvidence(c, ["r-1", "r-2"], acceptedAt));
	}
	assert.equal(corroboration.snapshot().observations, 3);
	c.set(12000);
	const cleared = corroboration.observe({
		execution: {
			preConsumerStalled: false,
			preConsumerStaleMs: STALE_MS,
			preConsumerStallRecords: []
		}
	});
	assert.equal(cleared.eligible, false);
	assert.equal(corroboration.snapshot().observations, 0);
}

/** Only the stalled set's fingerprint matters; surrounding evidence may churn freely. */
function proveUnrelatedEvidenceDoesNotDisturbWindow() {
	const c = clock();
	const corroboration = Corroboration.create({ now: c.now });
	const acceptedAt = 1000;
	const junkCounts = [5, 2, 9, 4, 3];
	for (let i = 0; i < junkCounts.length; i += 1) {
		c.set(9000 + i * 1000);
		const evidence = stallEvidence(c, ["r-1", "r-2"], acceptedAt);
		evidence.execution.preConsumerStallCount = junkCounts[i];
		evidence.execution.unresolved = 40 + i;
		evidence.pressure = { deferRepair: i % 2 === 0 };
		corroboration.observe(evidence);
	}
	assert.equal(corroboration.snapshot().eligible, true);
	assert.equal(corroboration.snapshot().reason, "execution_pre_consumer_stalled");
}

/**
 * End to end: the policy vetoes a bare claim, the fallback corroborates the exact
 * stall, and the unchanged pipeline (identity, sustain, preflight, ledger) repairs.
 */
function proveRecoveryVetoFallbackRepairsGenuineStall() {
	const c = clock();
	const harness = fakeLedger();
	const recovery = Recovery.create({
		ledger: harness.ledger,
		minimumObservations: 4,
		now: c.now,
		preflightOptions: { minimumObservations: 2, preflightMs: 250 },
		sustainMs: 4000,
		preConsumerCorroborationOptions: { minObservations: 4, sustainMs: 4000 }
	});
	const acceptedAt = 1000;
	const evidence = () => vetoedEvidence(c, ["r-1", "r-2"], acceptedAt);
	for (const t of [9000, 10000, 11000, 12000]) {
		c.set(t);
		const result = recovery.observe(evidence());
		assert.equal(result.repairAuthorized, false);
		assert.equal(result.reason, "pre_consumer_stall_unproven");
	}
	c.set(13000);
	const corroborated = recovery.observe(evidence());
	assert.equal(corroborated.repairAuthorized, false);
	assert.equal(corroborated.reason, "execution_pre_consumer_stalled");
	for (const t of [14000, 15000, 16000]) {
		c.set(t);
		assert.equal(recovery.observe(evidence()).repairAuthorized, false);
	}
	c.set(17000);
	assert.equal(recovery.observe(evidence()).reason, "repair_preflight");
	c.set(18000);
	const repaired = recovery.observe(evidence());
	assert.equal(repaired.repairAuthorized, true);
	assert.equal(repaired.reason, "execution_pre_consumer_stalled");
	assert.equal(harness.claims, 1);
}

/** Without exact records the veto stands: a bare claim never repairs. */
function proveRecoveryKeepsVetoWithoutProof() {
	const c = clock();
	const harness = fakeLedger();
	const recovery = Recovery.create({
		ledger: harness.ledger,
		minimumObservations: 2,
		now: c.now,
		preflightOptions: { minimumObservations: 2, preflightMs: 250 },
		sustainMs: 1000,
		preConsumerCorroborationOptions: { minObservations: 2, sustainMs: 0 }
	});
	for (const t of [9000, 10000, 11000, 12000, 13000]) {
		c.set(t);
		const result = recovery.observe({
			registered: true,
			repairIdentity: {
				parentPid: 4321,
				generation: 7,
				birthToken: "parent-birth-a",
				platform: "darwin"
			},
			execution: { consumerStalled: true, repairing: false }
		});
		assert.equal(result.repairAuthorized, false);
		assert.equal(result.reason, "pre_consumer_stall_unproven");
	}
	assert.equal(harness.claims, 0);
}

function clock() {
	let t = 0;
	return {
		now: () => t,
		set: (value) => { t = value; }
	};
}

function stallRecord(id, acceptedAt, now, overrides = {}) {
	return {
		id,
		phase: "accepted_waiting_for_consumer",
		ageMs: Math.max(0, now - acceptedAt),
		acceptedAt,
		phaseStartedAt: acceptedAt,
		lastProgressAt: acceptedAt,
		childIncarnationId: CHILD_A,
		...overrides
	};
}

function stallEvidence(c, ids, acceptedAt, overrides = {}) {
	return {
		execution: {
			preConsumerStalled: true,
			preConsumerStallCount: ids.length,
			preConsumerStaleMs: STALE_MS,
			preConsumerStallRecords: ids.map((id) =>
				stallRecord(id, acceptedAt, c.now(), overrides))
		}
	};
}

function vetoedEvidence(c, ids, acceptedAt) {
	return {
		registered: true,
		parentUnresponsive: false,
		controlStalled: false,
		pressure: { deferRepair: false },
		repairIdentity: {
			parentPid: 4321,
			generation: 7,
			processGroupId: 4321,
			birthToken: "parent-birth-a",
			platform: "darwin"
		},
		execution: {
			backpressured: false,
			consumerStalled: true,
			repairing: false,
			recentSuccess: false,
			preConsumerStalled: true,
			preConsumerStallCount: ids.length,
			preConsumerStaleMs: STALE_MS,
			preConsumerStallRecords: ids.map((id) => stallRecord(id, acceptedAt, c.now()))
		}
	};
}

function fakeLedger() {
	let claims = 0;
	return {
		get claims() {
			return claims;
		},
		ledger: {
			claim(reason, repairIdentity) {
				claims += 1;
				return {
					allowed: true,
					reason: "repair_claimed",
					recentRepairs: claims,
					identity: { ...repairIdentity }
				};
			},
			status() {
				return { history: [] };
			}
		}
	};
}
