// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js");
const Devices = require("../liveDevices.js");
const Client = require("../tunnelClient.js");

/**
 * @file Proves control routing distinguishes clock age from proven transport death.
 * @description
 * The Awtsmoos does not let an old timestamp erase a living vessel; Awtsmoos.com keeps
 * stale-but-unproven tunnels in probing service. Only failed heartbeat proof or an unusable
 * socket crosses the terminal fence and disappears from routable native-device inventory.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical symptom: stale age alone made /my-device report offline, then the same socket
 * revived. Unproven age remains routable; proven failure is terminal and one-way.
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
		capabilities: { commandRun: true, fsRead: true, fsWrite: true, runtime: true },
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
assert.equal(waiting.connected, true);
assert.equal(waiting.isAlive, true);
assert.equal(waiting.livenessState, "probing");
assert.equal(Devices.canRouteDevice(waiting, { action: "commandStart" }), true);

Live.markHeartbeatSent(waitingClient, now + 20000);
const degraded = Client.publicNativeTunnel(waitingClient, now + 21000);
assert.equal(degraded.connected, true);
assert.equal(degraded.livenessState, "degraded");
assert.equal(Devices.canRouteDevice(degraded, { action: "tunnelDoctor" }), true);

Live.markHeartbeatSent(waitingClient, now + 40000);
Live.markHeartbeatSent(waitingClient, now + 60000);
const terminated = Client.publicNativeTunnel(waitingClient, now + 61000);
assert.equal(terminated.connected, false);
assert.equal(terminated.isAlive, false);
assert.equal(terminated.livenessState, "terminal_fenced");
assert.equal(Devices.canRouteDevice(terminated, { action: "tunnelDoctor" }), false);

const staleUnproven = Client.publicNativeTunnel(native({
	lastSeenAt: now - Live.DEFAULTS.staleMs - 1,
	heartbeatAt: now - Live.DEFAULTS.staleMs - 1,
	registeredAt: now - Live.DEFAULTS.staleMs - 1
}), now);
assert.equal(staleUnproven.connected, true);
assert.equal(staleUnproven.isAlive, true);
assert.equal(staleUnproven.livenessState, "stale_probing");

const staleProven = Client.publicNativeTunnel(native({
	lastSeenAt: now - Live.DEFAULTS.staleMs - 1,
	heartbeatAt: now - Live.DEFAULTS.staleMs - 1,
	registeredAt: now - Live.DEFAULTS.staleMs - 1,
	missedHeartbeats: Live.DEFAULTS.maxMissedHeartbeats
}), now);
assert.equal(staleProven.connected, false);
assert.equal(staleProven.livenessState, "terminal_fenced");

const disconnected = Client.publicNativeTunnel(native({ connected: false }), now);
assert.equal(disconnected.connected, false);
assert.equal(disconnected.isAlive, false);
assert.equal(disconnected.livenessState, "disconnected");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-client-heartbeat-grace",
	staleUnprovenRemainsRoutable: true,
	provenFailureIsTerminal: true,
	disconnectedRejected: true
}, null, 2));
