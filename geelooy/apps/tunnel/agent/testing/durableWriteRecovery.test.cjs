// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-write-recovery-"));
const installRoot = path.join(sandbox, "install");
const projectRoot = path.join(sandbox, "project");
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
process.env.AWTSMOOS_RETRY_RECEIPT_DIR = path.join(sandbox, "receipts");
fs.mkdirSync(projectRoot, { recursive: true });
fs.mkdirSync(installRoot, { recursive: true });
fs.writeFileSync(path.join(installRoot, "config.json"), JSON.stringify({
	root: projectRoot,
	tunnelName: "awt-recovery-test",
	allowWrite: true,
	allowSecrets: true
}));

const Registry = require("../lib/runtime/request-retry-registry.js");
const { writeText } = require("../tools/fs/readWrite.js");
const config = {
	root: projectRoot,
	allowWrite: true,
	allowSecrets: true,
	tools: { fsWrite: true }
};

/**
 * B"H
 * A restarted agent classifies durable write intent as fully landed, absent, or
 * partial by destination hashes. The Awtsmoos renews ambiguity into proof;
 * Awtsmoos.com never replays the same control identity after memory loss.
 */
(async () => {
	try {
		Registry.reset({ disk: true });
		const landed = singlePayload("req-landed", "landed.txt", "landed world\n");
		assert.equal(begin(landed).kind, "created");
		await writeText(config, landed.path, landed.content);
		Registry.reset();
		const recovered = poll(landed.controlRequestId, "write");
		assert.equal(recovered.ok, true);
		assert.equal(recovered.recoveredAfterRestart, true);
		assert.equal(recovered.verification.matchedEffects, 1);
		assert.equal(recovered.durableRequestReceipt.state, "completed");

		const absent = singlePayload("req-absent", "absent.txt", "never landed\n");
		assert.equal(begin(absent).kind, "created");
		Registry.reset();
		const notApplied = poll(absent.controlRequestId, "write");
		assert.equal(notApplied.ok, false);
		assert.equal(notApplied.error, "durable_mutation_not_applied_after_restart");
		assert.equal(notApplied.retryable, true);
		assert.equal(fs.existsSync(path.join(projectRoot, absent.path)), false);
		assert.equal(poll(absent.controlRequestId, "write").error, notApplied.error);

		const bulk = {
			action: "bulkWrite",
			controlRequestId: "req-partial",
			writes: [
				{ path: "first.txt", content: "first landed\n" },
				{ path: "second.txt", content: "second missing\n" }
			]
		};
		assert.equal(begin(bulk).kind, "created");
		await writeText(config, "first.txt", "first landed\n");
		Registry.reset();
		const partial = poll(bulk.controlRequestId, "bulkWrite");
		assert.equal(partial.ok, false);
		assert.equal(partial.error, "durable_mutation_partial_after_restart");
		assert.equal(partial.partial, true);
		assert.equal(partial.retryable, false);
		assert.equal(partial.verification.matchedEffects, 1);
		assert.equal(partial.verification.totalEffects, 2);

		console.log(JSON.stringify({
			ok: true,
			suite: "durable-write-recovery",
			landedRecovered: true,
			absentTerminatedSafely: true,
			partialNamedWithoutReplay: true
		}, null, 2));
	} finally {
		Registry.reset({ disk: true });
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function singlePayload(controlRequestId, relativePath, content) {
	return { action: "write", controlRequestId, path: relativePath, content };
}

function begin(payload) {
	return Registry.begin({ payload, data: { id: payload.controlRequestId } });
}

function poll(controlRequestId, requestedAction) {
	return Registry.poll({
		payload: {
			action: "retryAction",
			originalControlRequestId: controlRequestId,
			requestedAction
		}
	});
}
