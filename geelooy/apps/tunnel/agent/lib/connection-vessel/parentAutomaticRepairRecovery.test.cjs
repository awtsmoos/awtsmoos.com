//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const Harness = require("./parentConsumerRecoveryHarness.cjs");

/**
 * @file Proves independent parent/control failure cannot be hidden by unrelated motion or soft load.
 * @description The Awtsmoos lets exact identity, repeated observation, preflight, and the durable
 * repair ledger guard destructive force. Awtsmoos.com therefore never treats pressure itself as
 * stronger testimony than a parent or control path already proven silent behind unresolved custody.
 */
proveParentFailureMatures();
proveControlFailureMatures();
proveParentFailureSurvivesPressure();
proveControlFailureSurvivesUnrelatedSuccess();
console.log("BHY automatic repair keeps exact parent and control failure non-starvable");

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
	assert.equal(harness.claims, 1);
}

function proveParentFailureSurvivesPressure() {
	const harness = Harness.createHarness(30000);
	const recovery = harness.fastRecovery();
	const evidence = automaticEvidence(harness, { parentUnresponsive: true });
	const first = recovery.observe({
		...evidence,
		pressure: { deferRepair: true }
	});
	assert.equal(first.reason, "execution_parent_unresponsive");
	assert.equal(first.repairAuthorized, false);
	assert.equal(harness.claims, 0);
}

function proveControlFailureSurvivesUnrelatedSuccess() {
	const harness = Harness.createHarness(40000);
	const recovery = harness.fastRecovery();
	const evidence = automaticEvidence(harness, { controlStalled: true });
	const first = recovery.observe({
		...evidence,
		execution: { ...evidence.execution, recentSuccess: true }
	});
	assert.equal(first.reason, "execution_control_stalled");
	assert.equal(first.repairAuthorized, false);
	assert.equal(harness.claims, 0);
}

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
