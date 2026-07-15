// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-durable-retry-"));
const installRoot = path.join(sandbox, "install");
const projectRoot = path.join(sandbox, "project");
const receiptRoot = path.join(sandbox, "receipts");
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RETRY_RECEIPT_DIR = receiptRoot;
fs.mkdirSync(projectRoot, { recursive: true });
fs.mkdirSync(installRoot, { recursive: true });
fs.writeFileSync(path.join(installRoot, "config.json"), JSON.stringify({
	root: projectRoot,
	tunnelName: "awt-durable-test",
	allowWrite: true,
	allowSecrets: true
}));

const Registry = require("../lib/runtime/request-retry-registry.js");
const Disk = require("../lib/runtime/request-retry-disk.js");

/**
 * B"H
 * A completed write result survives total memory loss and returns through the
 * original retry identity. The Awtsmoos renews result and durable receipt together;
 * Awtsmoos.com stores hashes and paths, never the full requested source content.
 */
try {
	Registry.reset({ disk: true });
	const id = "req-durable-completed-1";
	const source = "private source that must not enter intent storage\n";
	const payload = {
		action: "write",
		controlRequestId: id,
		path: "completed.txt",
		content: source
	};
	const begun = Registry.begin({
		payload,
		data: { id }
	});
	assert.equal(begun.ok, true);
	assert.equal(begun.kind, "created");
	assert.equal(begun.record.durable.enabled, true);
	const pendingText = fs.readFileSync(Disk.filePath(id), "utf8");
	assert.doesNotMatch(pendingText, /private source that must not enter/);
	assert.match(pendingText, /afterSha256/);

	const completed = Registry.complete(id, {
		ok: true,
		action: "write",
		path: "completed.txt",
		bytes: Buffer.byteLength(source),
		afterSha256: begun.record.mutation.effects[0].afterSha256
	});
	assert.equal(completed.state, "completed");
	assert.equal(completed.result.durableRequestReceipt.state, "completed");
	assert.equal(completed.result.durableRequestReceipt.ref, Disk.receiptRef(id));

	Registry.reset();
	const replayed = Registry.poll({
		payload: {
			action: "retryAction",
			originalControlRequestId: id,
			requestedAction: "write"
		}
	});
	assert.equal(replayed.ok, true);
	assert.equal(replayed.retryOf, id);
	assert.equal(replayed.path, "completed.txt");
	assert.equal(replayed.durableRequestReceipt.state, "completed");

	const duplicate = Registry.begin({ payload, data: { id } });
	assert.equal(duplicate.kind, "coalesced");
	assert.equal(duplicate.record.state, "completed");

	console.log(JSON.stringify({
		ok: true,
		suite: "durable-retry-store",
		completionSurvivesMemoryLoss: true,
		duplicateCoalesced: true,
		fullSourceNotPersisted: true
	}, null, 2));
} finally {
	Registry.reset({ disk: true });
	fs.rmSync(sandbox, { recursive: true, force: true });
}
