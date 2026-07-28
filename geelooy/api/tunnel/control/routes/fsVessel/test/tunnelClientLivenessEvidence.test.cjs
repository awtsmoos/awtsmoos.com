// B"H
const assert = require("assert");
const { publicNativeTunnel } = require("../tunnelClient.js");
const Live = require("../liveDevices.js");
const now = Date.now();
const device = publicNativeTunnel({ isTunnel: true, tunnelName: "awt-lagging", isAlive: false, lastSeenAt: now - 20000, registeredAt: now - 5 * 60 * 60 * 1000, allowCommands: true });
assert.equal(device.isAlive, false);
assert.equal(device.rawIsAlive, false);
assert.equal(device.evidenceFresh, true);
assert.equal(device.livenessState, "waiting_for_pong_or_frame");
assert.equal(device.newestEvidenceAt, device.lastSeenAt);
assert.equal(Live.isLiveDevice(device), false);
assert.deepEqual(Live.connectedNames([device]), []);
assert.equal(Live.deviceWarnings([device], []).length, 1);
assert.equal(Live.canRouteDevice(device, { action: "tunnelDoctor" }), false);
console.log(JSON.stringify({ ok: true, suite: "tunnelClientLivenessEvidence" }, null, 2));
