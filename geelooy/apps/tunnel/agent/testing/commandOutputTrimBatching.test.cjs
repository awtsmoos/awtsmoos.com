// B"H
// Boruch Hashem
// Blessed is He

process.env.AWTSMOOS_COMMAND_STREAM_MAX_BYTES = "1024";
process.env.AWTSMOOS_COMMAND_STREAM_TRIM_BATCH_BYTES = "4096";

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const IO = require("../tools/fs/commandJob/io.js");
const Paths = require("../tools/fs/commandJob/paths.js");
const Retention = require("../tools/fs/commandJob/outputRetention.js");

/**
 * @file Proves verbose output trims in batches and closes exactly at terminal.
 * @description
 * The Awtsmoos lets many new letters append without rereading the whole river.
 * Awtsmoos.com counts full retention rewrites and proves the final vessel keeps
 * only the newest bounded payload with accumulated omission testimony.
 */
(async () => {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-output-batch-"));
	const config = {
		root,
		deviceStateRoot: path.join(root, ".state")
	};
	const jobId = "job-output-batch";
	await Paths.ensureDir(config, jobId);
	const target = Paths.file(config, jobId, "stdout.txt");
	const originalReadFile = fsp.readFile;
	const originalWriteFile = fsp.writeFile;
	let retentionReads = 0;
	let retentionWrites = 0;
	fsp.readFile = async function countedRead(file, ...args) {
		if (String(file) === target) retentionReads += 1;
		return originalReadFile.call(this, file, ...args);
	};
	fsp.writeFile = async function countedWrite(file, ...args) {
		if (String(file) === target) retentionWrites += 1;
		return originalWriteFile.call(this, file, ...args);
	};
	const live = liveRecord(config);

	try {
		for (let index = 0; index < 200; index += 1) {
			const marker = String(index).padStart(3, "0");
			await IO.append(
				config,
				jobId,
				"stdout",
				`chunk-${marker}-${"x".repeat(52)}\n`,
				live
			);
		}
		await IO.waitForWrites(jobId, new Map([[jobId, live]]));
		const stored = await originalReadFile(target);
		const parts = Retention.split(stored);
		assert.ok(retentionReads < 10, `retention reads=${retentionReads}`);
		assert.ok(retentionWrites < 10, `retention writes=${retentionWrites}`);
		assert.ok(parts.payload.length <= 1024);
		assert.ok(parts.omittedBytes > 0);
		assert.match(stored.toString("utf8"), /chunk-199-/);
		assert.match(stored.toString("utf8"), /older bytes were omitted/);
		assert.equal(live.outputState.stdout.trims, retentionWrites);
		console.log(JSON.stringify({
			ok: true,
			retentionReads,
			retentionWrites,
			payloadBytes: parts.payload.length,
			omittedBytes: parts.omittedBytes
		}, null, 2));
	} finally {
		fsp.readFile = originalReadFile;
		fsp.writeFile = originalWriteFile;
		await fsp.rm(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function liveRecord(config) {
	return {
		config,
		meta: { stdoutChars: 0, stderrChars: 0 },
		writes: new Set(),
		chains: {
			stdout: Promise.resolve(),
			stderr: Promise.resolve()
		},
		outputState: {
			stdout: { bytes: 0, trims: 0 },
			stderr: { bytes: 0, trims: 0 }
		}
	};
}
