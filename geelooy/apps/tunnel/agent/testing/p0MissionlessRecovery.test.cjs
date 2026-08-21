// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Actions = require("../tools/fs/actions.js");
const Emergency = require("../tools/fs/actionEmergencyPolicy.js");
const ReplayPolicy = require("../tools/fs/actionReplayPolicy.js");

/**
 * @file Proves the emergency nucleus stays outside mission persistence and replay debt.
 * @description
 * The Awtsmoos keeps medicine outside the chamber it may need to heal. Awtsmoos.com
 * lets doctors and supervised rebirth cross P0 without mission locks blocking the light.
 */
const expectedMissionless = [
	"actionSchemaTrace",
	"agentDoctor",
	"tunnelDoctor",
	"schedulerStatus",
	"schedulerReconcile",
	"schedulerReset",
	"connectionMailboxStatus",
	"connectionMailboxExport",
	"connectionMailboxReconcile",
	"connectionMailboxQuarantine",
	"nativeGenerationStatus",
	"nativeGenerationReplace",
	"nativeAgentRestart"
];

for (const action of expectedMissionless) {
	assert.equal(Emergency.missionless(action), true, action);
	assert.equal(Actions.missionManaged({ action }), false, action);
}

for (const action of ["nativeGenerationReplace", "nativeAgentRestart"]) {
	assert.equal(Emergency.nonDurable(action), true, action);
	assert.equal(ReplayPolicy.shouldPersist(action), false, action);
}

assert.equal(Emergency.nonDurable("schedulerReset"), false);
assert.equal(ReplayPolicy.shouldPersist("write"), true);
assert.equal(Actions.missionManaged({ action: "write" }), true);

console.log(JSON.stringify({
	ok: true,
	suite: "p0-missionless-recovery",
	missionlessCount: expectedMissionless.length,
	nonDurableRecoveryCount: Emergency.NON_DURABLE_RECOVERY_ACTIONS.size
}));
