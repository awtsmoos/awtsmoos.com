// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-receipt-policy-"));
const installRoot = path.join(sandbox, "runtime");
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_DURABLE_RECEIPT_MAX = "100";
delete process.env.AWTSMOOS_RETRY_RECEIPT_DIR;
delete process.env.AWTSMOOS_RECOVERY_ROOT;

const Disk = require("../lib/runtime/request-retry-disk.js");
const Collection = require("../lib/runtime/request-retry-disk-collection.js");
const Policy = require("../lib/runtime/request-retry-policy.js");

/**
 * B"H
 * Durable receipts live beyond the replaceable runtime, retain completed truth
 * far longer than memory, preserve pending deeds, and prune oldest completed
 * overflow. The Awtsmoos renews permanence without permitting infinite disk growth.
 */
try {
	assert.equal(
		Disk.directory(),
		path.join(`${installRoot}-recovery`, "state", "request-receipts")
	);
	assert.ok(Policy.DURABLE_COMPLETED_TTL_MS > Policy.COMPLETED_TTL_MS);
	assert.equal(Policy.DURABLE_MAX_RECORDS, 100);

	const now = Date.now();
	writeRecord("pending-old", "pending", now - 60 * Policy.DAY);
	writeRecord("completed-expired", "completed", now - 31 * Policy.DAY);
	for (let index = 0; index < 102; index += 1) {
		writeRecord(`completed-${index}`, "completed", now - index * 1000);
	}
	const result = Collection.collect(now);
	assert.equal(Disk.read("pending-old").state, "pending");
	assert.equal(Disk.read("completed-expired"), null);
	const completed = Disk.list(1000).filter(record => record.state === "completed");
	assert.equal(completed.length, 100);
	assert.equal(result.removed, 3);
	assert.equal(result.pending, 1);

	console.log(JSON.stringify({
		ok: true,
		suite: "durable-receipt-policy",
		externalRecoveryRoot: true,
		durableTtlMs: Policy.DURABLE_COMPLETED_TTL_MS,
		pendingPreserved: true,
		completedBounded: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function writeRecord(controlRequestId, state, timestamp) {
	const iso = new Date(timestamp).toISOString();
	Disk.write({
		controlRequestId,
		requestedAction: "write",
		state,
		createdAt: iso,
		updatedAt: iso,
		completedAt: state === "completed" ? iso : null,
		durable: { enabled: true }
	});
}
