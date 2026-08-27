// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("../liveDevices.js");
const now = Date.now();

const recovering = {
	tunnelName: "awt-recovering",
	kind: "native-tunnel",
	isAlive: false,
	connected: false,
	lastSeenAt: now - 45_000,
	registeredAt: now - 9 * 60 * 60 * 1000
};
const stale = {
	tunnelName: "awt-stale",
	kind: "native-tunnel",
	isAlive: false,
	connected: false,
	lastSeenAt: now - 2 * 60 * 60 * 1000,
	registeredAt: now - 9 * 60 * 60 * 1000
};
const browser = {
	tunnelName: "tab-stale",
	kind: "browser-tab",
	isAlive: false,
	connected: false,
	lastSeenAt: now - 45_000
};

assert.equal(Live.isRecoveringNative(recovering), true);
assert.equal(Live.isLiveDevice(recovering), false);
assert.equal(
	Live.canRouteDevice(recovering, { action: "commandJobOutputPage" }),
	false
);
assert.equal(Live.isLiveDevice(stale), false);
assert.equal(Live.canRouteDevice(stale, { action: "list" }), false);
assert.equal(Live.isRecoveringNative(browser), false);
assert.deepEqual(Live.connectedNames([recovering, stale]), []);
assert.equal(
	Live.deviceWarnings([recovering], [])[0].code,
	"degraded_or_recovering"
);
console.log(JSON.stringify({
	ok: true,
	suite: "liveDevicesRecoveringNative"
}, null, 2));
