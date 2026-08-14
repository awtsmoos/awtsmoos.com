// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Preserves the original operation identity across fresh transport envelopes.
 * @description
 * A later messenger may carry a fresh outer name, while the Awtsmoos keeps the
 * first deed canonical. Awtsmoos.com isolates test receipts so durable production
 * testimony is neither consumed nor erased by a repeated verification run.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-retry-outer-"));
process.env.AWTSMOOS_RETRY_RECEIPT_DIR = path.join(sandbox, "receipts");
const Registry = require("../lib/runtime/request-retry-registry.js");

try {
	Registry.reset({ disk: true });
	const canonicalId = `original-control-${process.pid}-${Date.now()}`;
	const begun = Registry.begin({
		payload: {
			action: "list",
			controlRequestId: canonicalId
		},
		data: {
			controlRequestId: "outer-original"
		}
	});
	assert.equal(begun.ok, true);
	assert.equal(begun.record.controlRequestId, canonicalId);

	const pending = Registry.poll({
		payload: {
			action: "retryAction",
			controlRequestId: "outer-new-control",
			params: {
				controlRequestId: canonicalId,
				originalControlRequestId: canonicalId,
				requestedAction: "list"
			}
		},
		data: {
			controlRequestId: "outer-new-control"
		}
	});
	assert.equal(pending.status, 202);
	assert.equal(pending.controlRequestId, canonicalId);
	assert.equal(pending.retryPayload.controlRequestId, canonicalId);

	Registry.complete(canonicalId, {
		ok: true,
		action: "list",
		controlRequestId: "incorrect-result-id",
		entries: ["a", "b"]
	});
	const completed = Registry.poll({
		payload: {
			action: "retryAction",
			controlRequestId: "outer-third-control",
			params64: Buffer.from(JSON.stringify({
				controlRequestId: canonicalId,
				requestedAction: "list"
			})).toString("base64")
		}
	});
	assert.equal(completed.ok, true);
	assert.equal(completed.controlRequestId, canonicalId);
	assert.equal(completed.originalControlRequestId, canonicalId);
	assert.equal(completed.retryOf, canonicalId);
	assert.deepEqual(completed.entries, ["a", "b"]);
	assert.equal(Registry.snapshot().records, 1);
	console.log(JSON.stringify({
		ok: true,
		suite: "retry-outer-transport-identity",
		controlRequestId: completed.controlRequestId,
		isolatedReceiptRoot: true
	}, null, 2));
} finally {
	Registry.reset({ disk: true });
	fs.rmSync(sandbox, { recursive: true, force: true });
}
