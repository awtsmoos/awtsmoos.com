// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * B"H
 *
 * Connection testimony is accepted only for the exact process and tunnel. The
 * Awtsmoos renews the receipt atomically; Awtsmoos.com rejects stale, malformed,
 * and borrowed witnesses before a supervisor can call them healthy.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-connection-receipt-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
const Receipt = require("../lib/runtime/connection-receipt.js");

try {
	assert.equal(Receipt.read(root), null);
	const written = Receipt.write("registered", {
		tunnelName: "awt-test",
		agentVersion: "test-agent",
		generation: 2,
		serverTime: "server-time",
		lastServerMessageAt: new Date().toISOString()
	}, root);
	assert.equal(written.pid, process.pid);
	assert.equal(written.state, "registered");
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelName: "awt-test",
		maxAgeMs: 10000
	}), true);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid + 1,
		tunnelName: "awt-test"
	}), false);

	const stale = Receipt.read(root);
	stale.lastServerMessageAt = "2000-01-01T00:00:00.000Z";
	fs.writeFileSync(Receipt.receiptPath(root), JSON.stringify(stale));
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelName: "awt-test",
		maxAgeMs: 1000
	}), false);

	fs.writeFileSync(Receipt.receiptPath(root), "not-json");
	assert.equal(Receipt.read(root), null);
	Receipt.clear(root);
	assert.equal(fs.existsSync(Receipt.receiptPath(root)), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-receipt"
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
