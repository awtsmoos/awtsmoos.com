// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
	* @file Verifies parent ownership, child liveness, route, activation, and runtime.
	* @description
	* The Awtsmoos keeps supervised process identity distinct from connection breath.
	* Awtsmoos.com rejects receipts borrowed from another owner or immutable tunnel.
	*/
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-connection-receipt-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
process.env.AWTSMOOS_ACTIVATION_ID = "activation-test";
process.env.AWTSMOOS_RUNTIME_VERSION = "runtime-test";
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
	assert.equal(written.schemaVersion, 5);
	assert.equal(written.pid, process.pid);
	assert.equal(written.ownerPid, process.pid);
	assert.equal(written.connectionPid, process.pid);
	assert.equal(written.tunnelId, "tun_test_identity");
	assert.equal(written.activationId, "activation-test");
	assert.equal(written.runtimeVersion, "runtime-test");
	assert.equal(written.reconnectAttempt, 4);
	assert.equal(written.reconnectDelayMs, 8000);
	assert.equal(written.lastRegisteredAt, 12345);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelId: "tun_test_identity",
		tunnelName: "awt-test",
		activationId: "activation-test",
		runtimeVersion: "runtime-test",
		maxAgeMs: 10000
	}), true);
	assert.equal(Receipt.ownedByCurrentConnection(written), true);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid,
		tunnelId: "tun_other_identity"
	}), false);
	assert.equal(Receipt.matches(Receipt.read(root), {
		pid: process.pid + 1,
		tunnelName: "awt-test"
	}), false);
	assert.equal(Receipt.matches(Receipt.read(root), {
		activationId: "activation-other"
	}), false);
	assert.equal(Receipt.matches(Receipt.read(root), {
		runtimeVersion: "runtime-other"
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
	assert.equal(old.schemaVersion, 5);
	assert.equal(old.ownerPid, process.pid);
	assert.equal(old.connectionPid, process.pid);
	assert.equal(old.reconnectAttempt, 0);
	assert.equal(old.tunnelId, "");
	assert.equal(old.activationId, "");
	assert.equal(old.runtimeVersion, "");

	fs.writeFileSync(Receipt.receiptPath(root), "not-json");
	assert.equal(Receipt.read(root), null);
	Receipt.clear(root);
	assert.equal(fs.existsSync(Receipt.receiptPath(root)), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-receipt",
		parentOwnerBound: true,
		connectionProcessBound: true,
		authoritativeTunnelId: true,
		activationAndRuntimeBound: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
