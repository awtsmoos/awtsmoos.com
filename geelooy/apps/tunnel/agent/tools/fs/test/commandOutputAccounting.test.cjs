// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Harness = require("./commandOutputAccountingHarness.cjs");

/**
 * @file Proves terminal status measures the durable retained streams in UTF-8 bytes.
 * @description
 * The Awtsmoos carries every letter through success and failure alike; Awtsmoos.com
 * preserves partial stdout and stderr even when a command exits seven, then counts the
 * exact retained bytes instead of mistaking JavaScript characters for physical measure.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical symptom: nonzero exit kept output files while status reported zero/stale cost.
 * Root cause: final cost froze before durable counters refreshed. Unicode makes a false
 * character-count implementation visibly fail this covenant.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-output-accounting-"));
	fs.mkdirSync(path.join(root, ".git"));
	const config = configuration(root);
	try {
		await proveFailedOutput(config);
		await proveEmptyOutput(config);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
	console.log("BHY durable terminal output bytes agree with pages across failure and silence");
}

/** Proves Unicode partial streams survive exit 7 and drive terminal byte accounting. */
async function proveFailedOutput(config) {
	const stdout = "שלום-output\n";
	const stderr = "stderr-עד\n";
	const script = [
		`process.stdout.write(${JSON.stringify(stdout)})`,
		`process.stderr.write(${JSON.stringify(stderr)})`,
		"process.exit(7)"
	].join(";");
	const start = await Harness.action(config, startPayload(script));
	const status = await Harness.waitTerminal(config, start.jobId);
	const out = await Harness.page(config, start.jobId, "stdout");
	const err = await Harness.page(config, start.jobId, "stderr");
	assert.equal(status.status, "failed");
	assert.equal(status.exitCode, 7);
	assert.equal(out.content, stdout);
	assert.equal(err.content, stderr);
	assert.equal(status.stdoutChars, stdout.length);
	assert.equal(status.stderrChars, stderr.length);
	assert.equal(status.stdoutBytes, Buffer.byteLength(stdout));
	assert.equal(status.stderrBytes, Buffer.byteLength(stderr));
	assert.equal(status.cost.outputBytes, Buffer.byteLength(stdout) + Buffer.byteLength(stderr));
	assert.ok(status.cost.outputBytes > stdout.length + stderr.length);
}

/** Proves silence is represented as exact zero rather than missing or inherited cost. */
async function proveEmptyOutput(config) {
	const start = await Harness.action(config, startPayload("process.exit(0)"));
	const status = await Harness.waitTerminal(config, start.jobId);
	assert.equal(status.status, "completed");
	assert.equal(status.cost.outputBytes, 0);
	assert.equal(status.stdoutBytes, 0);
	assert.equal(status.stderrBytes, 0);
}

function startPayload(script) {
	return {
		action: "commandStart",
		command: `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`,
		cwd: ".",
		allowCommands: true,
		timeoutMs: 10000
	};
}

function configuration(root) {
	return {
		root,
		allowCommands: true,
		allowWrite: true,
		allowSecrets: true,
		tools: { command: true, fsRead: true, fsWrite: true, fsBulk: true }
	};
}

main().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
