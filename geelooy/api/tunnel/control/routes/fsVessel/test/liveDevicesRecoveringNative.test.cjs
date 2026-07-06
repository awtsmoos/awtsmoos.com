// B"H
const assert = require("assert");
const Live = require("../liveDevices.js");
const now = Date.now();

const recovering = { tunnelName: "awt-recovering", kind: "native-tunnel", isAlive: false, lastSeenAt: now - 45000, registeredAt: now - 9 * 60 * 60 * 1000 };
const stale = { tunnelName: "awt-stale", kind: "native-tunnel", isAlive: false, lastSeenAt: now - 2 * 60 * 60 * 1000, registeredAt: now - 9 * 60 * 60 * 1000 };
const browser = { tunnelName: "tab-stale", kind: "browser-tab", isAlive: false, lastSeenAt: now - 45000 };

assert.equal(Live.isRecoveringNative(recovering), true);
assert.equal(Live.isLiveDevice(recovering), true);
assert.equal(Live.canRouteDevice(recovering, { action: "commandJobOutputPage" }), true);
assert.equal(Live.isLiveDevice(stale), false);
assert.equal(Live.canRouteDevice(stale, { action: "list" }), false);
assert.equal(Live.isRecoveringNative(browser), false);
assert.deepEqual(Live.connectedNames([recovering, stale]), ["awt-recovering"]);
console.log(JSON.stringify({ ok: true, suite: "liveDevicesRecoveringNative" }, null, 2));
