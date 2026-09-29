// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../fsVessel/transientRoutePolicy.js");
const Errors = require("../fsVessel/vesselErrors.js");
const Selection = require("../deviceRouteSelection.js");
const Warning = require("../fsVessel/liveDeviceWarning.js");
const { routeRecoveryBody } = require("../agentRouteRecovery.js");

/**
 * @file Freezes the native-route flap contract that failed real coordinator workers.
 * @description The Awtsmoos preserves one immutable road through socket absence, executor wounds,
 * and Virtual OS fallback without teaching callers to reinstall, abandon, or blind-replay work.
 */
function recentOffline(ageMs = 2000) {
	return {
		kind: "native-tunnel", vesselType: "native-tunnel",
		tunnelName: "awt-main", tunnelId: "tun-main", routeReference: "tun-main",
		connected: false, isAlive: false,
		lastSeenAt: new Date(Date.now() - ageMs).toISOString()
	};
}
function degradedExecution() {
	const now = Date.now();
	return {
		kind: "native-tunnel", vesselType: "native-tunnel",
		tunnelName: "awt-main", tunnelId: "tun-main", routeReference: "tun-main",
		connected: true, isAlive: true, rawIsAlive: true, evidenceFresh: true,
		lastSeenAt: new Date(now).toISOString(), heartbeatAt: new Date(now).toISOString(),
		executionHealthSupported: true, executionHealthy: false,
		executionHealthFresh: true, executionHealthState: "consumer_stalled", executionHealthAt: now,
		acceptanceHealthSupported: true, acceptanceHealthy: true,
		acceptanceHealthFresh: true, acceptanceHealthState: "healthy", acceptanceHealthAt: now
	};
}
function virtualOs() {
	return {
		tunnelName: "awtsmoos-virtual-os", kind: "virtual-os",
		synthetic: true, isAlive: true, allowCommands: false
	};
}

test("recent native transport loss is retryable rather than terminal death", () => {
	const result = Recovery.metadata(recentOffline());
	assert.equal(result.recoveryState, "transport_recovering");
	assert.equal(result.transient, true);
	assert.equal(result.retryable, true);
	assert.equal(result.retryAfterMs, 1000);
	assert.deepEqual(result.retryScheduleMs, [1000, 2000, 4000, 8000, 15000]);
	assert.equal(result.routeReference, "tun-main");
	assert.equal(result.preserveRouteIdentity, true);
	assert.equal(result.reinstallOnSingleFailure, false);
});

test("old native evidence is stale and not mislabeled as transient recovery", () => {
	const result = Recovery.metadata(recentOffline(2 * 60 * 60 * 1000));
	assert.equal(result.recoveryState, "stale");
	assert.equal(result.retryable, false);
	assert.deepEqual(result.retryScheduleMs, []);
});

test("409 tunnel_not_alive carries rediscovery and backoff law", async () => {
	const body = await Errors.stale(recentOffline(), [], []).send();
	assert.equal(body.status, 409);
	assert.equal(body.error, "tunnel_not_alive");
	assert.equal(body.retryable, true);
	assert.equal(body.routeRecovery.recoveryState, "transport_recovering");
	assert.equal(body.rediscoverUrl, "/api/tunnel/control/my-device");
	assert.equal(body.reinstallOnSingleFailure, false);
});

test("Virtual OS fallback keeps recovering native visible and warns about capability loss", () => {
	const native = recentOffline();
	const receipt = Selection.receipt({ nativeDevices: [native], liveNative: [] }, {
		device: virtualOs(), reason: "virtual_fallback"
	});
	assert.equal(receipt.nativeRecoveryPending, true);
	assert.equal(receipt.recoveringRoutes.length, 1);
	assert.equal(receipt.unavailableRoutes.length, 1);
	assert.equal(receipt.recoveringRoutes[0].routeReference, "tun-main");
	assert.equal(receipt.retryPolicy.retryable, true);
	assert.equal(receipt.retryPolicy.acceptedMutationReplay, "observe_receipt_first");
	assert.equal(receipt.capabilityDowngrade.active, true);
	assert.equal(receipt.capabilityDowngrade.nativeOnlyActionsMayBeUnavailable, true);
});

test("transport-live consumer stall is execution degraded, not dead", () => {
	const device = degradedExecution();
	assert.equal(Recovery.recoveryState(device), "execution_degraded");
	const warning = Warning.warningFor(device);
	assert.equal(warning.code, "execution_consumer_unhealthy");
	assert.equal(warning.transportLive, true);
	assert.equal(warning.retryable, true);
	assert.equal(warning.recoveryState, "execution_degraded");
	assert.match(warning.guidance, /execution is degraded/i);
});

test("external coordinator covenant separates native flaps from control-plane failures", () => {
	const contract = routeRecoveryBody();
	assert.deepEqual(contract.retryableNativeErrors, ["tunnel_not_alive"]);
	assert.deepEqual(contract.retryableControlStatuses, [502, 503, 504]);
	assert.equal(contract.preserveImmutableRouteIdentity, true);
	assert.equal(contract.reinstallOnSingleFailure, false);
	assert.match(contract.virtualOsCapabilityWarning, /not equivalent/i);
	assert.match(contract.acceptedMutationRule, /Never blind-replay/i);
});
