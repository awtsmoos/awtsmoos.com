// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixtures = require("./helpers/crossRoot/fixtures.cjs");
const Gc = require("../tools/fs/commandJob/gc.js");
const ReceiptPaths = require("../tools/fs/commandJob/receiptPaths.js");
const {
	cancelCommandJob,
	commandJobOutputPage,
	commandStatus
} = require("../tools/fs/commandJobStore.js");

/**
 * @file Proves terminal full-room reclamation leaves a longer-lived compact incident receipt.
 * @description The Awtsmoos lets heavy output pass only after a bounded witness is sealed;
 * Awtsmoos.com can still recover terminal truth and labeled tails without replaying vanished work.
 */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-command-receipt-"));
	try {
		const roots = Fixtures.createForest(base);
		const jobId = "cmdjob_terminal_receipt_exact";
		const oldFinished = new Date(Date.now() - 60_000).toISOString();
		const record = Fixtures.writeJob(roots.current, jobId, {
			status: "completed",
			finishedAt: oldFinished,
			updatedAt: oldFinished,
			exitCode: 0,
			command: "printf receipt-test"
		});
		fs.writeFileSync(path.join(record.directory, "stdout.txt"), "x".repeat(20000));
		fs.writeFileSync(path.join(record.directory, "stderr.txt"), "B\"H stderr tail\n");
		const config = Fixtures.config(base, roots.current);
		const gc = await Gc.collect(config, {
			now: Date.now(),
			ttlMs: 1,
			maxBytes: 1024 * 1024 * 1024,
			receipt: { tailBytes: 4096 },
			receiptGc: { ttlMs: 7 * 24 * 60 * 60 * 1000, maxBytes: 1024 * 1024 }
		});
		assert.equal(gc.removed, 1);
		assert.equal(gc.receiptFailures, 0);
		assert.equal(fs.existsSync(record.directory), false);
		assert.equal(fs.existsSync(ReceiptPaths.receiptFile(config, jobId)), true);

		const status = await commandStatus(config, { jobId });
		assert.equal(status.ok, true);
		assert.equal(status.status, "completed");
		assert.equal(status.receiptOnly, true);
		assert.equal(status.fullOutputAvailable, false);

		const output = await commandJobOutputPage(config, { jobId, stream: "stdout" });
		assert.equal(output.ok, true);
		assert.equal(output.receiptOnly, true);
		assert.equal(output.outputPartial, true);
		assert.equal(output.retainedBytes, 4096);
		assert.equal(output.originalBytes, 20000);
		assert.equal(output.omittedBytes, 15904);

		const cancel = await cancelCommandJob(config, { jobId });
		assert.equal(cancel.ok, true);
		assert.equal(cancel.alreadyTerminal, true);
		assert.equal(cancel.receiptOnly, true);
		assert.equal(cancel.cancelled, false);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-job-terminal-receipt",
			receiptBeforeDelete: true,
			terminalStatusRecovered: true,
			partialOutputRecovered: true,
			cancelNeverReplays: true
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
