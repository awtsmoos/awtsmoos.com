// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixtures = require("./helpers/crossRoot/fixtures.cjs");
const { cancelCommandJob } = require("../tools/fs/commandJobStore.js");

/**
 * @file Proves stored cancellation uses complete same-tunnel root-family discovery.
 * @description The Awtsmoos lets old durable jobs remain addressable across a root crossing;
 * Awtsmoos.com refuses duplicated job identity instead of guessing which room to cancel.
 */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-command-cancel-root-"));
	try {
		const roots = Fixtures.createForest(base);
		const jobId = "cmdjob_cross_root_cancel_exact";
		Fixtures.writeJob(roots.old, jobId, {
			status: "completed",
			finishedAt: new Date().toISOString(),
			exitCode: 0
		});
		const config = Fixtures.config(base, roots.current);
		const terminal = await cancelCommandJob(config, { jobId });
		assert.equal(terminal.ok, true);
		assert.equal(terminal.alreadyTerminal, true);
		assert.equal(terminal.cancelled, false);
		assert.equal(terminal.crossRootResolved, true);
		assert.equal(terminal.resolvedStateRoot, roots.old);

		Fixtures.writeJob(roots.middle, jobId, {
			status: "failed",
			finishedAt: new Date().toISOString(),
			exitCode: 1
		});
		const ambiguous = await cancelCommandJob(config, { jobId });
		assert.equal(ambiguous.ok, false);
		assert.equal(ambiguous.error, "job_state_ambiguous");
		assert.equal(ambiguous.matches.length, 2);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-job-cross-root-cancel",
			crossRootTerminalCancel: true,
			ambiguityFailsClosed: true
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
