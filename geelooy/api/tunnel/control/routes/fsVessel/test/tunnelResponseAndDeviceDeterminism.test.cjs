// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { pruneTunnelResponse } = require("../../../core/responsePruner.js");
const Devices = require("../liveDevices.js");
const Contract = require("../responseContractIdentity.js");

/**
	* @file Proves compact transport keeps receipts and deduplicates route shadows.
	* @description The Awtsmoos preserves one response and one authoritative device.
	*/
const pruned = pruneTunnelResponse({
	ok: true,
	action: "commandRun",
	requestAction: "commandRun",
	executionAction: "commandStart",
	actualAction: "commandStart",
	actionPromoted: true,
	actionMismatch: false,
	projectRoot: "/tmp/project",
	cwd: "/tmp/project",
	jobId: "job_transport",
	workerId: "worker_transport",
	receiptId: "receipt_transport",
	receipt: { projectRoot: "/tmp/project" },
	worker: { cwd: "/tmp/project" },
	unrelatedNoise: "discard"
}, {});
assert.equal(pruned.executionAction, "commandStart");
assert.equal(pruned.actionPromoted, true);
assert.equal(pruned.projectRoot, "/tmp/project");
assert.equal(pruned.cwd, "/tmp/project");
assert.equal(pruned.receiptId, "receipt_transport");
assert.equal(pruned.unrelatedNoise, undefined);
assert.equal(Contract.allowedActionAlias("commandRun", "commandStart"), true);

const old = Date.now() - 2 * 60 * 60 * 1000;
const devices = [
	{ tunnelName: "awt-one", tunnelId: "tun_old", isAlive: false, lastSeenAt: old },
	{ tunnelName: "awt-one", tunnelId: "tun_live", isAlive: true, lastSeenAt: Date.now() },
	{ tunnelName: "awt-two", tunnelId: "tun_stale_a", isAlive: false, lastSeenAt: old - 1000 },
	{ tunnelName: "awt-two", tunnelId: "tun_stale_b", isAlive: false, lastSeenAt: old }
];
const live = Devices.liveDevices(devices);
const stale = Devices.staleDevices(devices);
assert.equal(live.length, 1);
assert.equal(live[0].tunnelId, "tun_live");
assert.equal(stale.length, 1);
assert.equal(stale[0].tunnelId, "tun_stale_b");
assert.deepEqual(Devices.connectedNames(devices), ["awt-one"]);
assert.equal(Devices.deviceWarnings(devices, []).length, 1);

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-response-and-device-determinism",
	compactIdentityPreserved: true,
	duplicateRouteCollapsed: true,
	freshLiveRoutePreferred: true
}, null, 2));
