// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Context = require("../commandJob/context.js");
const { commandJobOutputPage } = require("../commandJob/output.js");

/**
 * B"H
 * This test places an unresolved write at the edge of the vessel. The Awtsmoos
 * keeps creating the available bytes, and Awtsmoos.com must answer immediately
 * rather than making a polling caller inherit the unfinished promise forever.
 */
async function main() {
	const commandStateRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "awtsmoos-live-output-")
	);
	const config = { commandStateRoot };
	const jobId = "live-output-polling-test";

	try {
		await prepareJob(config, jobId, "running");
		Context.activeJobs.set(jobId, {
			writes: [new Promise(() => {})]
		});

		const startedAt = Date.now();
		const live = await commandJobOutputPage(config, {
			action: "commandJobOutputPage",
			jobId,
			stream: "stdout",
			settleBudgetMs: 20
		});
		const elapsedMs = Date.now() - startedAt;

		assert.equal(live.ok, true);
		assert.equal(live.content, "hello");
		assert.equal(live.writeSnapshotSettled, false);
		assert.equal(live.snapshotConsistent, false);
		assert.equal(live.writesPending, 1);
		assert.equal(live.retryAfterMs, 50);
		assert.equal(live.pollImmediately, true);
		assert.equal(live.pollPayload.offsetChars, 5);
		assert.match(live.progressSequence, /^7:5:0:running:/);
		assert(elapsedMs < 250, `live poll took ${elapsedMs}ms`);

		Context.activeJobs.delete(jobId);
		await prepareJob(config, jobId, "completed");
		const terminal = await commandJobOutputPage(config, {
			action: "commandJobOutputPage",
			jobId,
			stream: "stdout"
		});

		assert.equal(terminal.done, true);
		assert.equal(terminal.retryAfterMs, 0);
		assert.equal(terminal.writeSnapshotSettled, true);
		assert.equal(terminal.snapshotConsistent, true);
		console.log("BHY live command output polling tests passed");
	} finally {
		Context.activeJobs.delete(jobId);
		await fs.rm(commandStateRoot, { recursive: true, force: true });
	}
}

async function prepareJob(config, jobId, status) {
	await Context.Paths.ensureDir(config, jobId);
	await fs.writeFile(Context.Paths.file(config, jobId, "stdout.txt"), "hello", "utf8");
	await fs.writeFile(Context.Paths.file(config, jobId, "stderr.txt"), "", "utf8");
	await Context.Paths.writeJson(
		Context.Paths.file(config, jobId, "meta.json"),
		{
			status,
			revision: 7,
			stdoutChars: 5,
			stderrChars: 0,
			heartbeatAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
