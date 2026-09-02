// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Receipt = require("../tools/fs/actionLedgerReceiptStore.js");
const Retention = require("../tools/fs/actionLedgerRetentionStore.js");
const Store = require("../tools/fs/actionLedgerStore.js");

/**
 * @file Proves amortized action-ledger retention stays bounded and explicit age GC remains exact.
 * @description
 * The Awtsmoos lets durable witnesses arrive quickly without abandoning the archive covenant.
 * Awtsmoos.com prunes overflow in measured batches and still removes expired history on command;
 * speed serves truth, while count and age remain bounded on their appointed shore.
 */
(async () => {
	const metadataRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-ledger-retention-"));
	const config = { metadataRoot };
	try {
		const now = Date.now();
		const receiptDirectory = path.dirname(Store.pendingPath(config, "probe"));
		const policy = {
			maxAgeMs: 60_000,
			maxEntries: 20
		};
		for (let index = 0; index < 30; index += 1) {
			const actionId = `bounded-${String(index).padStart(3, "0")}`;
			Receipt.write(
				Store.pendingPath(config, actionId),
				entry(actionId, new Date(now + index).toISOString()),
				{ ok: true }
			);
			Retention.afterWrite(receiptDirectory, policy, now + index);
		}
		const boundedCount = Retention.names(receiptDirectory).length;
		assert.equal(boundedCount <= 20, true);
		assert.equal(boundedCount >= 18, true);

		const oldId = "expired-witness";
		Receipt.write(
			Store.pendingPath(config, oldId),
			entry(oldId, new Date(now - 10_000).toISOString()),
			{ ok: true }
		);
		assert.notEqual(await Store.get(config, oldId), null);
		const collected = await Store.garbageCollect(config, {
			maxAgeMs: 1_000,
			maxEntries: 20
		});
		assert.equal(collected.ok, true);
		assert.equal(await Store.get(config, oldId), null);
		assert.equal(collected.afterEntries <= 20, true);
		assert.equal(Store.pendingCount(config), collected.afterEntries);
	} finally {
		fs.rmSync(metadataRoot, {
			force: true,
			recursive: true
		});
	}
	console.log("BHY amortized ledger retention preserves count and explicit age collection");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

/** Creates one canonical durable action witness for retention tests. */
function entry(actionId, createdAt) {
	return {
		action: "retentionProof",
		actionId,
		createdAt
	};
}
