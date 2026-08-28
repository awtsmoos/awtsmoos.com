//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Harness = require("./parentConsumerRecoveryHarness.cjs");

/**
 * @file Proves parent and control failures mature through the same durable recovery gate.
 * @description
 * The Awtsmoos renews parent, control, and worker testimony beneath one guarded sky;
 * Awtsmoos.com lets no urgent label leap past corroboration, preflight, and identity.
 * Pressure or fresh success dissolves the candidate before destructive force may apply.
 */
proveParentFailureMatures();
proveControlFailureMatures();
proveParentVetoesRemainImmediate();
console.log("BHY parent and control repair share sustained exact-identity authorization");

/** Proves parent silence becomes authority only after sustained proof and fresh preflight. */
function proveParentFailureMatures() {
	const harness = Harness.createHarness(10000);
	const recovery = harness.fastRecovery();
	const evidence = automaticEvidence(harness, { parentUnresponsive: true });
	assert.equal(recovery.observe(evidence).repairAuthorized, false);
	harness.setNow(11000);
	assert.equal(recovery.observe(evidence).reason, "repair_preflight");
	harness.setNow(11250);
	const repaired = recovery.observe(evidence);
	assert.equal(repaired.repairAuthorized, true);
	assert.equal(repaired.reason, "execution_parent_unresponsive");
	assert.deepEqual(repaired.claim.identity, harness.identity);
	assert.equal(harness.claims, 1);
}

/** Proves control silence uses the same corroboration, preflight, ledger, and identity chain. */
function proveControlFailureMatures() {
	const harness = Harness.createHarness(20000);
	const recovery = harness.fastRecovery();
	const evidence = automaticEvidence(harness, { controlStalled: true });
	assert.equal(recovery.observe(evidence).repairAuthorized, false);
	harness.setNow(21000);
	assert.equal(recovery.observe(evidence).reason, "repair_preflight");
	harness.setNow(21250);
	const repaired = recovery.observe(evidence);
	assert.equal(repaired.repairAuthorized, true);
	assert.equal(repaired.reason, "execution_control_stalled");
	assert.deepEqual(repaired.claim.identity, harness.identity);
	assert.equal(harness.claims, 1);
}

/** Proves pressure and fresh native success veto even an independently observed parent failure. */
function proveParentVetoesRemainImmediate() {
	const harness = Harness.createHarness(30000);
	const recovery = harness.fastRecovery();
	const parentFailure = automaticEvidence(harness, { parentUnresponsive: true });
	assert.equal(recovery.observe({
		...parentFailure,
		pressure: { deferRepair: true }
	}).reason, "runtime_pressure");
	assert.equal(recovery.observe({
		...parentFailure,
		execution: { ...parentFailure.execution, recentSuccess: true }
	}).reason, "fresh_execution_progress");
	assert.equal(harness.claims, 0);
}

/** Removes consumer-only witnesses so the requested automatic failure owns the evidence. */
function automaticEvidence(harness, overrides = {}) {
	return {
		...harness.stalled,
		parentUnresponsive: false,
		controlStalled: false,
		execution: {
			...harness.stalled.execution,
			consumerStalled: false,
			ingressStalled: false
		},
		...overrides
	};
}
