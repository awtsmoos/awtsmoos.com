// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

/**
 * @file Proves transactional installer custody survives death of the invoking parent process.
 * @description The Awtsmoos moves installation beyond the garment it replaces; Awtsmoos.com
 * requires durable receipt, exact exit state, and cleanup even when the caller disappears.
 */
const source = path.resolve(__dirname, "../../downloads/unix-install-custody.cjs");

(async () => {
	const survival = world("survival", 0, 800);
	const parent = spawn(process.execPath, [
		survival.custody, "delegate", survival.core, survival.runtime,
		survival.recovery, survival.root
	], { env: { ...process.env, AWTSMOOS_TEST_MARKER: survival.marker }, stdio: "ignore" });
	await waitFor(() => readReceipt(survival)?.state === "running", 4000);
	parent.kill("SIGTERM");
	await onceClosed(parent);
	const receipt = await waitFor(() => {
		const value = readReceipt(survival);
		return value?.terminal ? value : null;
	}, 6000);
	assert.equal(receipt.state, "completed");
	assert.equal(receipt.exitCode, 0);
	assert.equal(fs.readFileSync(survival.marker, "utf8").trim(), "survived");
	assert.equal(fs.existsSync(survival.runtime), false);

	const failure = world("failure", 7, 0);
	const result = spawnSync(process.execPath, [
		failure.custody, "delegate", failure.core, failure.runtime,
		failure.recovery, failure.root
	], { env: { ...process.env, AWTSMOOS_TEST_MARKER: failure.marker }, encoding: "utf8", timeout: 6000 });
	assert.equal(result.status, 7, `${result.stdout}\n${result.stderr}`);
	assert.equal(readReceipt(failure).exitCode, 7);
	assert.equal(fs.existsSync(failure.runtime), false);

	console.log(JSON.stringify({ ok: true, suite: "unix-installer-custody-survival", parentDeathSurvived: true, failureExitPreserved: true }));
	fs.rmSync(survival.root, { recursive: true, force: true });
	fs.rmSync(failure.root, { recursive: true, force: true });
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function world(name, exitCode, delayMs) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), `awts-custody-${name}-`));
	const runtime = path.join(root, "runtime");
	const recovery = path.join(root, "recovery");
	const marker = path.join(root, "marker.txt");
	fs.mkdirSync(runtime, { recursive: true });
	const custody = path.join(runtime, "unix-install-custody.cjs");
	const core = path.join(runtime, "unix-install-core.sh");
	fs.copyFileSync(source, custody);
	fs.writeFileSync(core, `#!/usr/bin/env bash\nset -e\nsleep ${delayMs / 1000}\nprintf 'survived\\n' > "$AWTSMOOS_TEST_MARKER"\nexit ${exitCode}\n`, { mode: 0o700 });
	return { core, custody, marker, recovery, root, runtime };
}

function readReceipt(worldState) {
	const file = path.join(worldState.recovery, "transactions/installer-custody-current.json");
	try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

async function waitFor(reader, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const value = reader();
		if (value) return value;
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error("custody_test_timeout");
}

function onceClosed(child) {
	return new Promise(resolve => child.once("close", resolve));
}
