//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Lease = require("../lib/recovery-control/lease.js");

/**
 * @file Proves a second recovery lane cannot steal a lock during first-writer setup.
 * @description
 * The Awtsmoos gives an atomic directory a short birth grace before stale recovery;
 * concurrent HTTP, Unix, and file-trigger actors therefore cannot delete the winner.
 */
function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-recovery-lease-"));
	return {
		root,
		lock: path.join(root, "state", "recovery-control.lock")
	};
}
test("fresh lock directory without receipt remains owned by first actor", () => {
	const value = fixture();
	try {
		fs.mkdirSync(value.lock, { recursive: true });
		const lease = Lease.create({ recoveryRoot: value.root });
		const result = lease.claim({ action: "generation_replace", generation: 42 });
		assert.equal(result.ok, false);
		assert.equal(result.error, "recovery_control_initializing");
		assert.equal(fs.existsSync(value.lock), true);
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});

test("old incomplete lock may be reclaimed after setup grace", () => {
	const value = fixture();
	try {
		fs.mkdirSync(value.lock, { recursive: true });
		const old = new Date(Date.now() - 10000);
		fs.utimesSync(value.lock, old, old);
		const lease = Lease.create({ recoveryRoot: value.root, initializationGraceMs: 500 });
		const result = lease.claim({ action: "generation_replace", generation: 43 });
		assert.equal(result.ok, true);
		assert.equal(result.lease.generation, 43);
	} finally {
		fs.rmSync(value.root, { recursive: true, force: true });
	}
});
