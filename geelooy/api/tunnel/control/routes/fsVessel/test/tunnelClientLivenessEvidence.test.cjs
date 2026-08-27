// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Devices = require("../liveDevices.js");
const Client = require("../tunnelClient.js");

/**
 * @file Proves fresh evidence outranks one stale boolean during pong delay.
 * @description
 * The Awtsmoos distinguishes the raw last-pong flag from effective routability.
 * Recent frames plus a usable socket keep the device visible as degraded, while
 * truly stale evidence remains unroutable and produces a recovery warning.
 */
const now = Date.parse("2026-08-05T07:00:00.000Z");
const delayedPong = Client.publicNativeTunnel({
	connected: true,
	isAlive: false,
	awaitingPong: true,
	missedHeartbeats: 1,
	tunnelId: "tun-delayed-pong",
	tunnelName: "awt-delayed-pong",
	deviceId: "dev-delayed-pong",
	deviceName: "Delayed Pong",
	platform: "darwin",
	registeredAt: now - 60000,
	lastSeenAt: now - 5000,
	heartbeatAt: now - 5000,
	socket: { destroyed: false, writable: true },
	capabilities: { commandRun: true, fsRead: true }
}, now);

assert.equal(delayedPong.rawIsAlive, false);
assert.equal(delayedPong.evidenceFresh, true);
assert.equal(delayedPong.connected, true);
assert.equal(delayedPong.isAlive, true);
assert.equal(delayedPong.livenessState, "degraded");
assert.equal(Devices.isLiveDevice(delayedPong), true);
assert.deepEqual(Devices.connectedNames([delayedPong]), ["awt-delayed-pong"]);
assert.deepEqual(Devices.deviceWarnings([delayedPong], []), []);

const stale = Client.publicNativeTunnel({
	connected: true,
	isAlive: false,
	awaitingPong: true,
	missedHeartbeats: 3,
	tunnelId: "tun-stale",
	tunnelName: "awt-stale",
	deviceId: "dev-stale",
	registeredAt: now - 180000,
	lastSeenAt: now - 180000,
	heartbeatAt: now - 180000,
	socket: { destroyed: false, writable: true }
}, now);

assert.equal(stale.connected, false);
assert.equal(stale.isAlive, false);
assert.equal(Devices.isLiveDevice(stale), false);
assert.equal(Devices.connectedNames([stale]).length, 0);
const warnings = Devices.deviceWarnings([stale], []);
assert.equal(warnings.length, 1);
assert.equal(warnings[0].tunnelName, "awt-stale");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-client-liveness-evidence",
	freshRawFalseStillRoutable: true,
	staleThresholdRejected: true
}, null, 2));
