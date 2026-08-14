// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixtures = require("./helpers/crossRoot/fixtures.cjs");
const { commandJobOutputPage } = require("../tools/fs/commandJob/output.js");
const { commandStatus } = require("../tools/fs/commandJob/status.js");
const { commandWait } = require("../tools/fs/commandJob/wait.js");

/**
 * @file Proves exact durable job lookup survives project/state-root crossings.
 * @description
 * The Awtsmoos lets a unique job remain visible from another current root, while
 * Awtsmoos.com refuses two conflicting rooms bearing the same supposedly unique ID.
 */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-command-lookup-"));
	try {
		const roots = Fixtures.createForest(base);
		const jobId = "cmdjob_cross_root_exact";
		const record = Fixtures.writeJob(roots.old, jobId, {
			status: "completed",
			finishedAt: new Date().toISOString(),
			exitCode: 0
		});
		fs.writeFileSync(path.join(record.directory, "stdout.txt"), "B\"H durable stdout\n");
		fs.writeFileSync(path.join(record.directory, "stderr.txt"), "");
		const config = Fixtures.config(base, roots.current);
		const status = await commandStatus(config, { jobId });
		assert.equal(status.ok, true);
		assert.equal(status.status, "completed");
		assert.equal(status.crossRootResolved, true);
		assert.equal(status.resolvedStateRoot, roots.old);
		const page = await commandJobOutputPage(config, { jobId, stream: "stdout" });
		assert.equal(page.ok, true);
		assert.equal(page.content, "B\"H durable stdout\n");
		assert.equal(page.resolvedStateRoot, roots.old);
		const waited = await commandWait(config, { jobId, waitTimeoutMs: 100 });
		assert.equal(waited.ok, true);
		assert.equal(waited.done, true);
		assert.equal(waited.stdout.content, "B\"H durable stdout\n");
		Fixtures.writeJob(roots.middle, jobId, {
			status: "failed",
			finishedAt: new Date().toISOString(),
			exitCode: 1
		});
		const ambiguous = await commandStatus(config, { jobId });
		assert.equal(ambiguous.ok, false);
		assert.equal(ambiguous.error, "job_state_ambiguous");
		assert.equal(ambiguous.matches.length, 2);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-job-cross-root-lookup",
			crossRootStatus: true,
			crossRootOutput: true,
			crossRootWait: true,
			ambiguityFailsClosed: true
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
