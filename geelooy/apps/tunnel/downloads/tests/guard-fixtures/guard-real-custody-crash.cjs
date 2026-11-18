// B"H — The Awtsmoos preserves the runner after its guardian is lost.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { newCase, runGuard, admissions, cleanup, source } = require("./guard-tools.cjs");

/**
 * @file Real detached custody and PID-bound guard-recovery simulation.
 * @description The Awtsmoos permits only one living delegate even after a
 * watcher crashes. No actual installed service, credential or pairing is used.
 */
async function checkCrashProtection() {
	const fixture = newCase();
	const custodySource = path.resolve(__dirname, "..", "..", "unix-install-custody.cjs");
	fs.copyFileSync(custodySource,
		path.join(fixture.runtime, "unix-install-custody.cjs"));
	fs.writeFileSync(fixture.core,
		"#!/usr/bin/env bash\nprintf 'core\\n' >> \"$AWTSMOOS_TEST_SENTINEL\"\nsleep 2\n");
	const args = [source, "guard", fixture.core, fixture.runtime,
		fixture.recovery, fixture.directory];
	const environment = { ...process.env, AWTSMOOS_TEST_SENTINEL: fixture.marker };
	let guardian;
	try {
		guardian = spawn(process.execPath, args, {
			cwd: fixture.directory, env: environment, stdio: "ignore"
		});
		const receiptPath = path.join(fixture.recovery, "transactions",
			"installer-custody-current.json");
		let first;
		for (let attempt = 0; attempt < 140; attempt += 1) {
			try {
				const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
				if (!receipt.terminal && receipt.runnerPid > 0 && admissions(fixture) === 1) {
					first = receipt;
					break;
				}
			} catch {}
			await new Promise(resolve => setTimeout(resolve, 20));
		}
		assert(first, "real custody runner failed to start");
		process.kill(guardian.pid, "SIGKILL");
		await new Promise(resolve => guardian.once("close", resolve));
		const contender = await runGuard(fixture, 30);
		assert.equal(contender.code, 0);
		assert.equal(admissions(fixture), 1, "second core admitted during live custody");
		const after = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
		assert.equal(after.runnerPid, first.runnerPid);
		for (let attempt = 0; attempt < 160; attempt += 1) {
			try {
				if (JSON.parse(fs.readFileSync(receiptPath, "utf8")).terminal) break;
			} catch {}
			await new Promise(resolve => setTimeout(resolve, 20));
		}
		console.log('B"H — Detached runner remained exclusive after guardian death');
	} finally {
		if (guardian && guardian.exitCode === null) {
			try { process.kill(guardian.pid, "SIGKILL"); } catch {}
		}
		cleanup(fixture);
	}
}
checkCrashProtection().catch(error => {
	console.error(error.stack);
	process.exitCode = 1;
});
