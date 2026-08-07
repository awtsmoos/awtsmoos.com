// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Live = require("../routes/fsVessel/liveDevices.js");
const Identity = require("../routes/fsVessel/liveDeviceIdentity.js");
const View = require("../routes/fsVessel/nativeInventoryView.js");

/**
 * @file Proves transport-green cannot outrank known execution sickness.
 * @description
 * The Awtsmoos lets an older agent cross the release bridge while newer testimony
 * becomes stricter. Awtsmoos.com keeps diagnostics reachable on a degraded socket,
 * but ordinary work requires execution authority once that health protocol exists.
 */
test("legacy native route remains rollout-compatible", () => {
	const legacy = device({ executionHealthSupported: false });
	assert.equal(Identity.isTransportLive(legacy), true);
	assert.equal(Identity.isLiveDevice(legacy), true);
	assert.equal(Live.canRouteDevice(legacy, { action: "read" }), true);
	assert.equal(View.isRoutable(legacy), true);
});

test("supported unhealthy execution blocks ordinary work but permits diagnosis", () => {
	const degraded = device({
		executionHealthSupported: true,
		executionHealthy: false,
		executionHealthState: "consumer_stalled"
	});
	assert.equal(Identity.isTransportLive(degraded), true);
	assert.equal(Identity.isLiveDevice(degraded), false);
	assert.equal(Live.canRouteDevice(degraded, { action: "read" }), false);
	assert.equal(Live.canRouteDevice(degraded, { action: "commandRun" }), false);
	assert.equal(Live.canRouteDevice(degraded, { action: "tunnelDoctor" }), true);
	assert.equal(Live.canRouteDevice(degraded, { action: "commandJobStatus" }), true);
	assert.equal(View.isRoutable(degraded), false);
	assert.equal(Live.deviceWarnings([degraded], [])[0].code, "execution_consumer_unhealthy");
});

test("supported healthy execution restores ordinary routing", () => {
	const healthy = device({
		executionHealthSupported: true,
		executionHealthy: true,
		executionHealthState: "healthy"
	});
	assert.equal(Identity.isLiveDevice(healthy), true);
	assert.equal(Live.canRouteDevice(healthy, { action: "read" }), true);
});

function device(patch = {}) {
	return {
		isAlive: true,
		connected: true,
		tunnelId: "tun_health_fixture",
		routeReference: "tun_health_fixture",
		tunnelName: "awt-health-fixture",
		kind: "native-tunnel",
		lastSeenAt: new Date().toISOString(),
		...patch
	};
}
