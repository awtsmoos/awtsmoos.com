// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

/** Proves a cleanup pulse reads one bounded page rather than the whole receipt archive. */
test("durable receipt cleanup rotates through bounded pages", t => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-receipt-batch-"));
	const originalDirectory = process.env.AWTSMOOS_RETRY_RECEIPT_DIR;
	const originalMaximum = process.env.AWTSMOOS_DURABLE_RECEIPT_MAX;
	t.after(() => {
		fs.rmSync(sandbox, { recursive: true, force: true });
		restore("AWTSMOOS_RETRY_RECEIPT_DIR", originalDirectory);
		restore("AWTSMOOS_DURABLE_RECEIPT_MAX", originalMaximum);
		clearModules();
	});
	process.env.AWTSMOOS_RETRY_RECEIPT_DIR = sandbox;
	process.env.AWTSMOOS_DURABLE_RECEIPT_MAX = "500";
	clearModules();
	const Disk = require("../lib/runtime/request-retry-disk.js");
	const Collection = require("../lib/runtime/request-retry-disk-collection.js");
	for (let index = 0; index < 300; index += 1) writeReceipt(Disk, index);
	const first = Collection.collect(Collection.COLLECTION_INTERVAL_MS);
	const second = Collection.collect(Collection.COLLECTION_INTERVAL_MS * 2);
	assert.equal(first.total, 300);
	assert.ok(first.scanned > 0 && first.scanned <= Collection.BATCH_SIZE);
	assert.ok(second.scanned > 0 && second.scanned <= Collection.BATCH_SIZE);
	assert.notEqual(first.page, second.page);
	assert.equal(first.truncated, true);
	assert.equal(Disk.read("batch-299").state, "pending");
});

function writeReceipt(Disk, index) {
	const at = new Date(Date.now() - index * 1000).toISOString();
	Disk.write({
		controlRequestId: `batch-${index}`,
		state: index === 299 ? "pending" : "completed",
		createdAt: at,
		updatedAt: at,
		completedAt: index === 299 ? null : at
	});
}

function restore(name, value) {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}

function clearModules() {
	for (const name of ["request-retry-disk.js", "request-retry-disk-paths.js", "request-retry-disk-collection.js", "request-retry-policy.js"]) {
		delete require.cache[require.resolve(`../lib/runtime/${name}`)];
	}
}
