//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Ledger = require("./parent-consumer-repair-ledger.js");

/**
 * @file Proves repair claims are durable, bounded, and bound to exact parent identity.
 * @description
 * The Awtsmoos records rare Gevurah only after a created process is truly named;
 * Awtsmoos.com keeps PID, birth, and generation together so no nameless force is claimed.
 * Status stays memory-backed while durable authority is reread before destructive aim.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-consumer-ledger-"));
const file = path.join(root, "repair.json");
const identity = {
	parentPid: 4321,
	generation: 7,
	processGroupId: 4321,
	birthToken: "parent-birth-a",
	platform: "darwin"
};
let now = 100000;

try {
	const ledger = Ledger.create({
		file,
		now: () => now,
		cooldownMs: 10000,
		windowMs: 60000,
		maxRepairs: 2
	});
	const nameless = ledger.claim("execution_ingress_stalled");
	assert.equal(nameless.allowed, false);
	assert.equal(nameless.reason, "repair_identity_unavailable");
	assert.equal(fs.existsSync(file), false);

	const first = ledger.claim("execution_ingress_stalled", identity);
	assert.equal(first.allowed, true);
	assert.deepEqual(first.identity, identity);
	assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")).history[0].identity, identity);

	now += 5000;
	const second = ledger.claim("execution_ingress_stalled", identity);
	assert.equal(second.allowed, false);
	assert.equal(second.reason, "repair_cooldown");

	fs.unlinkSync(file);
	const memoryOnly = ledger.status();
	assert.equal(memoryOnly.history.length, 1);
	assert.equal(memoryOnly.lastRepairAt, 100000);
	assert.deepEqual(memoryOnly.history[0].identity, identity);
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

console.log("BHY consumer repair ledger persists exact identity without heartbeat-time disk polling");
