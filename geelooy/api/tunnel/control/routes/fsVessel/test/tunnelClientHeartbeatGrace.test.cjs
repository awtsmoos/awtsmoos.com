// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js");
const Devices = require("../liveDevices.js");
const Client = require("../tunnelClient.js");

/**
	* @file Proves ping-wait is routable while stale and disconnected sockets are not.
	* @description The Awtsmoos keeps heartbeat uncertainty distinct from route death.
	*/
const now = Date.parse("2026-07-27T02:15:00.000Z");

function native(overrides = {}) {
	return {
		connected: true,
		isAlive: true,
		tunnelId: "tun-heartbeat-proof",
		tunnelName: "awt-heartbeat-proof",
		deviceId: "dev-heartbeat-proof",
		deviceName: "Heartbeat Proof",
		platform: "darwin-x64",
		agentVersion: "split-agent-2.0.0",
		registeredAt: now - 60000,
		lastSeenAt: now - 1000,
		heartbeatAt: now - 1000,
		missedHeartbeats: 0,
		capabilities: {
			commandRun: true,
			fsRead: true,
			fsWrite: true,
			runtime: true
		},
		...overrides
	};
}

const active = Client.publicNativeTunnel(native(), now);
assert.equal(active.connected, true);
assert.equal(active.isAlive, true);
assert.equal(active.livenessState, "active");

const waitingClient = native();
Live.markHeartbeatSent(waitingClient, now);
const waiting = Client.publicNativeTunnel(waitingClient, now + 1000);
assert.equal(waitingClient.isAlive, false);
assert.equal(waiting.connected, true);
assert.equal(waiting.isAlive, true);
assert.equal(waiting.livenessState, "probing");
assert.equal(Devices.canRouteDevice(waiting, { action: "commandStart" }), true);
Live.markHeartbeatSent(waitingClient, now + 20000);
const missed = Client.publicNativeTunnel(waitingClient, now + 21000);
assert.equal(missed.connected, false);
assert.equal(missed.isAlive, false);
assert.equal(missed.livenessState, "waiting_for_pong_or_frame");
assert.equal(Devices.canRouteDevice(missed, { action: "tunnelDoctor" }), false);

const stale = Client.publicNativeTunnel(native({
	isAlive: false,
	lastSeenAt: now - Live.DEFAULTS.staleMs - 1,
	heartbeatAt: now - Live.DEFAULTS.staleMs - 1,
	registeredAt: now - Live.DEFAULTS.staleMs - 1,
	missedHeartbeats: Live.DEFAULTS.maxMissedHeartbeats
}), now);
assert.equal(stale.connected, false);
assert.equal(stale.isAlive, false);
assert.equal(stale.livenessState, "stale_terminate_ready");

const disconnected = Client.publicNativeTunnel(native({ connected: false }), now);
assert.equal(disconnected.connected, false);
assert.equal(disconnected.isAlive, false);
assert.equal(disconnected.livenessState, "disconnected");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-client-heartbeat-grace",
	activeRoutable: true,
	firstPingProbeRoutable: true,
	missedPongRejected: true,
	staleRejected: true,
	disconnectedRejected: true
}, null, 2));
