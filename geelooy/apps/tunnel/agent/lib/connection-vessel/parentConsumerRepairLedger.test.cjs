// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Ledger = require("./parent-consumer-repair-ledger.js");

/**
 * @file Proves repair cooldown is durable while ordinary status remains memory-backed.
 * @description
 * The Awtsmoos records rare Gevurah once and lets the living heartbeat stay light.
 * Awtsmoos.com rereads disk when repair authority is requested, not during every
 * five-hundred-millisecond health frame.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-consumer-ledger-"));
const file = path.join(root, "repair.json");
let now = 100000;

try {
	const ledger = Ledger.create({
		file,
		now: () => now,
		cooldownMs: 10000,
		windowMs: 60000,
		maxRepairs: 2
	});
	const first = ledger.claim("execution_ingress_stalled");
	assert.equal(first.allowed, true);
	assert.equal(ledger.status().history.length, 1);

	now += 5000;
	const second = ledger.claim("execution_ingress_stalled");
	assert.equal(second.allowed, false);
	assert.equal(second.reason, "repair_cooldown");

	fs.unlinkSync(file);
	const memoryOnly = ledger.status();
	assert.equal(memoryOnly.history.length, 1);
	assert.equal(memoryOnly.lastRepairAt, 100000);
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

console.log("BHY consumer repair ledger persists claims without heartbeat-time disk polling");
