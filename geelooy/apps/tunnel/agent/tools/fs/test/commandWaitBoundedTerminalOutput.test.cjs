// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Context = require("../commandJob/context.js");
const { commandWait } = require("../commandJob/wait.js");

/**
 * @file Proves terminal command waiting never inherits an unresolved output-write promise.
 * @description
 * The Awtsmoos reveals durable bytes through a measured pane while one later write may remain unseen;
 * Awtsmoos.com marks the snapshot unsettled instead of chaining terminal truth to a promise without end or sheen.
 * The watcher returns honestly and quickly, while future polling may gather whatever bytes are still between.
 */
async function main() {
	const commandStateRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "awtsmoos-command-wait-bounded-")
	);
	const config = { commandStateRoot };
	const jobId = "bounded-terminal-output-test";

	try {
		await prepareCompletedJob(config, jobId);
		Context.activeJobs.set(jobId, {
			writes: [new Promise(() => {})]
		});

		const startedAt = Date.now();
		const result = await Promise.race([
			commandWait(config, {
				action: "commandWait",
				jobId,
				inlineOutput: true,
				settleBudgetMs: 20,
				waitTimeoutMs: 200
			}),
			deadline(750)
		]);
		const elapsedMs = Date.now() - startedAt;

		assert.notEqual(result, "deadline_exceeded");
		assert.equal(result.ok, true);
		assert.equal(result.done, true);
		assert.equal(result.status, "completed");
		assert.equal(result.stdout.content, "hello");
		assert.equal(result.stdout.snapshotConsistent, false);
		assert.equal(result.stdout.writeSnapshotSettled, false);
		assert.equal(result.stdout.writesPending, 1);
		assert.equal(result.stderr.snapshotConsistent, false);
		assert.equal(result.stderr.writeSnapshotSettled, false);
		assert.equal(result.stderr.writesPending, 1);
		assert(elapsedMs < 750, `bounded commandWait took ${elapsedMs}ms`);

		console.log(JSON.stringify({
			ok: true,
			suite: "command-wait-bounded-terminal-output",
			elapsedMs,
			terminalReturned: true,
			unsettledSnapshotReported: true
		}, null, 2));
	} finally {
		Context.activeJobs.delete(jobId);
		await fs.rm(commandStateRoot, { recursive: true, force: true });
	}
}

async function prepareCompletedJob(config, jobId) {
	await Context.Paths.ensureDir(config, jobId);
	await fs.writeFile(
		Context.Paths.file(config, jobId, "stdout.txt"),
		"hello",
		"utf8"
	);
	await fs.writeFile(
		Context.Paths.file(config, jobId, "stderr.txt"),
		"",
		"utf8"
	);
	await Context.Paths.writeJson(
		Context.Paths.file(config, jobId, "meta.json"),
		{
			status: "completed",
			revision: 7,
			stdoutChars: 5,
			stderrChars: 0,
			heartbeatAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	);
}

function deadline(milliseconds) {
	return new Promise(resolve => {
		setTimeout(() => resolve("deadline_exceeded"), milliseconds);
	});
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
