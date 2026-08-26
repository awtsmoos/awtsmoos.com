// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./parent-consumer-recovery.js");
const Harness = require("./parentConsumerRecoveryHarness.cjs");

/**
 * @file Proves sustained silence, fresh-progress vetoes, and post-maturity preflight.
 * @description
 * The Awtsmoos lets transient pressure dissolve without force; Awtsmoos.com requires
 * measured corroboration and a fresh witness before repair, then resets the covenant
 * so neither success nor cooldown can become a destructive polling loop.
 */
const harness = Harness.createHarness();

proveSustainedCandidate();
proveFreshWitnessCancelsMatureCandidate();
provePersistentStallRepairsOnce();
proveImmediateVetoes();
console.log("BHY consumer recovery preserves corroboration, preflight, vetoes, and bounded healing");

/** Proves the historical four-observation window still cannot claim repair early. */
function proveSustainedCandidate() {
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

/** Recreates the false-SIGTERM race: fresh success after maturity must erase force. */
function proveFreshWitnessCancelsMatureCandidate() {
	harness.setNow(20000);
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
	assert.equal(fresh.repairAuthorized, false);
	assert.equal(recovery.snapshot().preflight.active, false);
	assert.equal(harness.claims, 0);
}

/** Proves genuine sustained silence survives preflight and earns exactly one claim. */
function provePersistentStallRepairsOnce() {
	harness.setNow(30000);
	const recovery = harness.fastRecovery();
	assert.equal(recovery.observe(harness.stalled).repairAuthorized, false);
	harness.setNow(31000);
	assert.equal(recovery.observe(harness.stalled).reason, "repair_preflight");
	harness.setNow(31250);
	const repaired = recovery.observe(harness.stalled);
	assert.equal(repaired.repairAuthorized, true);
	assert.equal(repaired.reason, "execution_ingress_stalled");
	assert.equal(repaired.claimReason, "execution_ingress_stalled");
	assert.equal(harness.claims, 1);
	harness.setNow(31300);
	assert.equal(recovery.observe(harness.stalled).repairAuthorized, false);
	assert.equal(harness.claims, 1);
}

/** Proves fresh execution and runtime pressure remain immediate repair vetoes. */
function proveImmediateVetoes() {
	harness.setNow(40000);
	const recovery = harness.fastRecovery();
	assert.equal(recovery.observe({
		...harness.stalled,
		execution: { ...harness.stalled.execution, recentSuccess: true }
	}).reason, "fresh_execution_progress");
	assert.equal(recovery.observe({
		...harness.stalled,
		pressure: { deferRepair: true }
	}).reason, "runtime_pressure");
	assert.equal(harness.claims, 1);
}
