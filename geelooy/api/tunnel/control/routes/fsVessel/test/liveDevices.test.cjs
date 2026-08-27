// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	connectedNames,
	deviceWarnings,
	isLiveDevice,
	liveDevices,
	staleDevices
} = require("../liveDevices.js");

const devices = [
	{
		tunnelName: "alive",
		isAlive: true,
		connected: true,
		kind: "native-tunnel"
	},
	{
		tunnelName: "dead",
		isAlive: false,
		connected: false,
		kind: "native-tunnel"
	},
	{
		tunnelName: "legacy-unknown",
		kind: "browser-tab"
	}
];

assert.equal(isLiveDevice(devices[0]), true);
assert.equal(isLiveDevice(devices[1]), false);
assert.equal(isLiveDevice(devices[2]), false);
assert.deepEqual(liveDevices(devices).map(device => device.tunnelName), ["alive"]);
assert.deepEqual(
	staleDevices(devices).map(device => device.tunnelName),
	["dead", "legacy-unknown"]
);
assert.deepEqual(connectedNames(devices), ["alive"]);
assert.equal(deviceWarnings(devices, []).length, 2);
console.log("BHY liveDevices requires affirmative transport liveness");
