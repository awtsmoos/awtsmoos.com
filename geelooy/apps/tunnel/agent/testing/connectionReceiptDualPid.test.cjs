// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Receipt = require("../lib/runtime/connection-receipt.js");

/**
	* @file Proves installer health follows parent while liveness follows child.
	* @description The Awtsmoos keeps supervision and connection identities distinct.
	*/
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-receipt-"));
const previous = process.env.AWTSMOOS_CONNECTION_OWNER_PID;
process.env.AWTSMOOS_CONNECTION_OWNER_PID = "424242";

try {
	const receipt = Receipt.write("registered", {
		tunnelId: "tun_dual_pid",
		tunnelName: "awt-dual-pid",
		generation: 7
	}, root);
	assert.equal(receipt.pid, 424242);
	assert.equal(receipt.ownerPid, 424242);
	assert.equal(receipt.connectionPid, process.pid);
	assert.equal(Receipt.matches(receipt, {
		pid: 424242,
		tunnelId: "tun_dual_pid",
		tunnelName: "awt-dual-pid"
	}), true);
	assert.equal(Receipt.ownedByCurrentConnection(receipt), true);
	const updated = Receipt.markServerSeen({ generation: 7 }, root);
	assert.equal(updated.pid, 424242);
	assert.equal(updated.connectionPid, process.pid);
	assert.ok(updated.lastServerMessageAt);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-receipt-dual-pid",
		parentOwnsHealth: true,
		childOwnsLiveness: true
	}, null, 2));
} finally {
	if (previous === undefined) delete process.env.AWTSMOOS_CONNECTION_OWNER_PID;
	else process.env.AWTSMOOS_CONNECTION_OWNER_PID = previous;
	fs.rmSync(root, { recursive: true, force: true });
}
