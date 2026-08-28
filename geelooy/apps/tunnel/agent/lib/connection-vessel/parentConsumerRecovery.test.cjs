//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./parent-consumer-recovery.js");
const Harness = require("./parentConsumerRecoveryHarness.cjs");

/**
 * @file Proves corroboration, vetoes, preflight, and exact identity stay one covenant.
 * @description
 * The Awtsmoos renews process and generation; stale testimony must dissolve from view.
 * Awtsmoos.com lets sustained silence mature only while one exact identity remains true.
 * Fresh success, pressure, or a changed birth begins the witnessing cycle anew.
 */
proveSustainedCandidate();
proveFreshWitnessCancelsCandidate();
provePersistentStallRepairsOnce();
proveIdentityChangeRestartsCorroboration();
proveImmediateVetoes();
console.log("BHY consumer recovery preserves identity-bound corroboration and bounded healing");

/** Proves the historical observation window cannot claim repair before preflight matures. */
function proveSustainedCandidate() {
	const harness = Harness.createHarness();
	const recovery = Recovery.create({
		ledger: harness.ledger,
		minimumObservations: 4,
		now: harness.clock,
		preflightOptions: { minimumObservations: 2, preflightMs: 250 },
		sustainMs: 4000
	});
	for (const instant of [10000, 11000, 12000, 13000, 14000]) {
		harness.setNow(instant);
		assert.equal(recovery.observe(harness.stalled).repairAuthorized, false);
	}
	assert.equal(recovery.snapshot().preflight.active, true);
	assert.equal(harness.claims, 0);
}

/** Proves fresh execution after maturity erases candidate and preflight testimony. */
function proveFreshWitnessCancelsCandidate() {
	const harness = Harness.createHarness(20000);
	const recovery = harness.fastRecovery();
	assert.equal(recovery.observe(harness.stalled).repairAuthorized, false);
	harness.setNow(21000);
	assert.equal(recovery.observe(harness.stalled).reason, "repair_preflight");
	harness.setNow(21250);
	const fresh = recovery.observe({
		...harness.stalled,
		execution: { ...harness.stalled.execution, recentSuccess: true }
	});
	assert.equal(fresh.reason, "fresh_execution_progress");
	assert.equal(recovery.snapshot().preflight.active, false);
	assert.equal(harness.claims, 0);
}

/** Proves persistent silence earns one durable identity-bearing claim. */
function provePersistentStallRepairsOnce() {
	const harness = Harness.createHarness(30000);
	const recovery = harness.fastRecovery();
	assert.equal(recovery.observe(harness.stalled).repairAuthorized, false);
	harness.setNow(31000);
	assert.equal(recovery.observe(harness.stalled).reason, "repair_preflight");
	harness.setNow(31250);
	const repaired = recovery.observe(harness.stalled);
	assert.equal(repaired.repairAuthorized, true);
	assert.equal(repaired.reason, "execution_ingress_stalled");
	assert.deepEqual(repaired.claim.identity, harness.identity);
	assert.equal(harness.claims, 1);
}

/** Proves same PID with a new generation or birth cannot inherit old corroboration. */
function proveIdentityChangeRestartsCorroboration() {
	const harness = Harness.createHarness(40000);
	const recovery = harness.fastRecovery();
	assert.equal(recovery.observe(harness.stalled).repairAuthorized, false);
	harness.setNow(41000);
	assert.equal(recovery.observe(harness.stalled).reason, "repair_preflight");
	harness.setNow(41250);
	const changed = {
		...harness.stalled,
		repairIdentity: {
			...harness.identity,
			generation: 8,
			birthToken: "parent-birth-b"
		}
	};
	const restarted = recovery.observe(changed);
	assert.equal(restarted.repairAuthorized, false);
	assert.equal(restarted.candidateAgeMs, 0);
	assert.equal(recovery.snapshot().observations, 1);
	assert.equal(harness.claims, 0);
}

/** Proves fresh execution and runtime pressure remain immediate repair vetoes. */
function proveImmediateVetoes() {
	const harness = Harness.createHarness(50000);
	const recovery = harness.fastRecovery();
	assert.equal(recovery.observe({
		...harness.stalled,
		execution: { ...harness.stalled.execution, recentSuccess: true }
	}).reason, "fresh_execution_progress");
	assert.equal(recovery.observe({
		...harness.stalled,
		pressure: { deferRepair: true }
	}).reason, "runtime_pressure");
	assert.equal(harness.claims, 0);
}
