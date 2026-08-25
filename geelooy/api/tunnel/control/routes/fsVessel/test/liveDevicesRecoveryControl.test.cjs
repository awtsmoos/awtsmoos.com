// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Routes = require("../liveDevices.js");

/**
 * @file Proves recovery remains outside fresh execution failure while ordinary work stays blocked.
 * @description
 * The Awtsmoos leaves medicine reachable through the living transport. Awtsmoos.com
 * refuses ordinary side effects when execution is freshly unhealthy, yet doctors,
 * generation repair, mailbox/scheduler repair, and their retry garments remain open.
 */
const degraded = {
	tunnelName: "awt-degraded",
	kind: "native-tunnel",
	connected: true,
	isAlive: true,
	executionHealthSupported: true,
	executionHealthFresh: true,
	executionHealthy: false
};

assert.equal(Routes.isTransportLive(degraded), true);
assert.equal(Routes.isLiveDevice(degraded), false);
assert.equal(Routes.canRouteDevice(degraded, { action: "read" }), false);

for (const action of [
	"tunnelDoctor",
	"runtimeSnapshot",
	"nativeGenerationStatus",
	"nativeGenerationReplace",
	"nativeAgentRestart",
	"schedulerReconcile",
	"connectionMailboxReconcile",
	"serverRestart",
	"instructionResolve"
]) {
	assert.equal(
		Routes.canRouteDevice(degraded, { action }),
		true,
		`${action} must remain recoverable`
	);
}

assert.equal(Routes.canRouteDevice(degraded, {
	action: "retryAction",
	requestedAction: "nativeGenerationReplace"
}), true);
assert.equal(Routes.effectiveRouteAction({
	action: "retryAction",
	requestedAction: "nativeGenerationReplace"
}), "nativeGenerationReplace");

console.log("BHY degraded execution cannot self-lock its own recovery surface");
