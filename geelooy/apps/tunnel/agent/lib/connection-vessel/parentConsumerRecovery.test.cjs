// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./parent-consumer-recovery.js");
const Harness = require("./parentConsumerRecoveryHarness.cjs");

/**
 * @file Proves exact stalls mature despite unrelated motion while true health cancels repair.
 * @description
 * The Awtsmoos renews each request by its own testimony; Awtsmoos.com lets a healthy
 * request dissolve Gevurah, but never lets another request's success conceal abandoned custody.
 */
proveSustainedCandidate();
proveFreshHealthCancelsCandidate();
proveUnrelatedSuccessCannotMaskStall();
provePersistentStallRepairsOnce();
proveIdentityChangeRestartsCorroboration();
provePressureCannotMaskExactStall();
console.log("BHY consumer recovery keeps exact stalled custody non-starvable");

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

function proveFreshHealthCancelsCandidate() {
	const harness = Harness.createHarness(20000);
	const recovery = harness.fastRecovery();
	recovery.observe(harness.stalled);
	harness.setNow(20500);
	const healthy = recovery.observe({
		...harness.stalled,
		execution: {
			...harness.stalled.execution,
			consumerStalled: false,
			ingressStalled: false,
			recentSuccess: true
		}
	});
	assert.equal(healthy.reason, "fresh_execution_progress");
	assert.equal(recovery.snapshot().observations, 0);
}

function proveUnrelatedSuccessCannotMaskStall() {
	const harness = Harness.createHarness(25000);
	const recovery = harness.fastRecovery();
	const stalled = {
		...harness.stalled,
		execution: { ...harness.stalled.execution, recentSuccess: true }
	};
	assert.equal(recovery.observe(stalled).reason, "execution_ingress_stalled");
	harness.setNow(26000);
	assert.equal(recovery.observe(stalled).reason, "repair_preflight");
	harness.setNow(26250);
	assert.equal(recovery.observe(stalled).repairAuthorized, true);
}

function provePersistentStallRepairsOnce() {
	const harness = Harness.createHarness(30000);
	const recovery = harness.fastRecovery();
	recovery.observe(harness.stalled);
	harness.setNow(31000);
	assert.equal(recovery.observe(harness.stalled).reason, "repair_preflight");
	harness.setNow(31250);
	const repaired = recovery.observe(harness.stalled);
	assert.equal(repaired.repairAuthorized, true);
	assert.equal(harness.claims, 1);
}

function proveIdentityChangeRestartsCorroboration() {
	const harness = Harness.createHarness(40000);
	const recovery = harness.fastRecovery();
	recovery.observe(harness.stalled);
	harness.setNow(41000);
	recovery.observe(harness.stalled);
	harness.setNow(41250);
	const changed = {
		...harness.stalled,
		repairIdentity: { ...harness.identity, generation: 8, birthToken: "parent-birth-b" }
	};
	assert.equal(recovery.observe(changed).repairAuthorized, false);
	assert.equal(recovery.snapshot().observations, 1);
	assert.equal(harness.claims, 0);
}

function provePressureCannotMaskExactStall() {
	const harness = Harness.createHarness(50000);
	const recovery = harness.fastRecovery();
	const result = recovery.observe({
		...harness.stalled,
		pressure: { deferRepair: true }
	});
	assert.equal(result.reason, "execution_ingress_stalled");
	assert.equal(result.repairAuthorized, false);
	assert.equal(harness.claims, 0);
}
