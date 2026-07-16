// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Verifies durable route identity and reconnect testimony for one process.
 * @description
 * The Awtsmoos renews friendly name, tunnel ID, generation, and recovery pressure.
 * Awtsmoos.com rejects stale or borrowed receipts before an installer or supervisor
 * can mistake an opened process for a healthy account-scoped connection.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-connection-receipt-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
const Receipt = require("../lib/runtime/connection-receipt.js");

try {
	assert.equal(Receipt.read(root), null);
	const written = Receipt.write("registered", {
		tunnelId: "tun_test_identity",
		tunnelName: "awt-test",
		agentVersion: "test-agent",
		generation: 2,
		reconnectAttempt: 4,
		reconnectDelayMs: 8000,
		lastRegisteredAt: 12345,
		serverTime: "server-time",
		lastServerMessageAt: new Date().toISOString()
	}, root);
	assert.equal(written.schemaVersion, 3);
	assert.equal(written.pid, process.pid);
	assert.equal(written.tunnelId, "tun_test_identity");
	assert.equal(written.reconnectAttempt, 4);
	assert.equal(written.reconnectDelayMs, 8000);
	assert.equal(written.lastRegisteredAt, 12345);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelId: "tun_test_identity",
		tunnelName: "awt-test",
		maxAgeMs: 10000
	}), true);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelId: "tun_other_identity"
	}), false);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid + 1,
		tunnelName: "awt-test"
	}), false);

	const stale = Receipt.read(root);
	stale.lastServerMessageAt = "2000-01-01T00:00:00.000Z";
	fs.writeFileSync(Receipt.receiptPath(root), JSON.stringify(stale));
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelId: "tun_test_identity",
		maxAgeMs: 1000
	}), false);

	const old = Receipt.normalize({
		state: "registered",
		pid: process.pid,
		tunnelName: "legacy"
	});
	assert.equal(old.schemaVersion, 3);
	assert.equal(old.reconnectAttempt, 0);
	assert.equal(old.tunnelId, "");

	fs.writeFileSync(Receipt.receiptPath(root), "not-json");
	assert.equal(Receipt.read(root), null);
	Receipt.clear(root);
	assert.equal(fs.existsSync(Receipt.receiptPath(root)), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-receipt",
		authoritativeTunnelId: true,
		reconnectTestimony: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
