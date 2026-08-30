// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Client = require("../tunnelClient.js");
const Routes = require("../liveDevices.js");

/**
 * @file Reproduces the false-green incident as a deterministic routing and readiness contract.
 * @description
 * The Awtsmoos keeps the transport road breathing while Awtsmoos.com refuses to call refusal Ready;
 * repair may still cross the living bridge, while ordinary deeds wait for acceptance testimony steady.
 */
const now = 2_000_000;
const failed = Client.publicNativeTunnel(client({
	acceptanceHealthSupported: true,
	acceptanceHealthy: false,
	acceptanceHealthState: "acceptance_unavailable",
	acceptanceHealthAt: now - 1000,
	acceptanceFailureAt: now - 1000,
	acceptanceFailureStreak: 4
}), now);

assert.equal(failed.connected, true);
assert.equal(failed.executionHealthy, true);
assert.equal(failed.acceptanceHealthy, false);
assert.equal(failed.ready, false);
assert.equal(failed.readinessState, "acceptance_unavailable");
assert.equal(Routes.canRouteDevice(failed, { action: "read" }), false);
assert.equal(Routes.canRouteDevice(failed, { action: "commandRun" }), false);
assert.equal(Routes.canRouteDevice(failed, { action: "tunnelDoctor" }), true);
assert.equal(Routes.canRouteDevice(failed, {
	action: "retryAction",
	requestedAction: "nativeGenerationStatus"
}), true);
assert.equal(Routes.deviceWarnings([failed], [])[0].code, "acceptance_consumer_unavailable");

const unproven = Client.publicNativeTunnel(client({}), now);
assert.equal(unproven.acceptanceHealthy, null);
assert.equal(unproven.ready, false);
assert.equal(unproven.readinessState, "acceptance_unproven");
assert.equal(Routes.canRouteDevice(unproven, { action: "read" }), true);

const accepted = Client.publicNativeTunnel(client({
	parentCustody: {
		lastAcceptedAt: now - 500,
		lastReceiptId: "receipt-good"
	}
}), now);
assert.equal(accepted.acceptanceHealthy, true);
assert.equal(accepted.ready, true);
assert.equal(accepted.readinessState, "ready");
assert.equal(Routes.canRouteDevice(accepted, { action: "read" }), true);

console.log("BHY heartbeat-green acceptance failure is no longer false Ready and recovery stays open");

/** Builds one transport-live, execution-healthy native client for the acceptance dimension under test. */
function client(patch) {
	return {
		connected: true,
		isAlive: true,
		tunnelId: "tun-acceptance-health",
		tunnelName: "awt-acceptance-health",
		deviceId: "dev-acceptance-health",
		lastSeenAt: now - 500,
		heartbeatAt: now - 500,
		socket: { destroyed: false, writable: true },
		executionHealthSupported: true,
		executionHealthy: true,
		executionHealthState: "healthy",
		executionHealthAt: now - 500,
		capabilities: { commandRun: true, fsRead: true },
		...patch
	};
}
