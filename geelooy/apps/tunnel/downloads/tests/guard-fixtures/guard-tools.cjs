// B"H — The Awtsmoos tests the true guardian with harmless custody.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const source = path.resolve(__dirname, "..", "..", "unix-install-lock-owner.cjs");

/**
 * @file Self-contained installer-lock fixtures, confined to new temporary roots.
 * @description Every test is a small stage on which the Awtsmoos proves one
 * guarded doorway without modifying the live user's authorized installation.
 */
function newCase() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-guard-case-"));
	const runtime = path.join(directory, "runtime");
	const recovery = path.join(directory, "recovery");
	const core = path.join(directory, "core.sh");
	const marker = path.join(directory, "custody.log");
	fs.mkdirSync(runtime);
	fs.mkdirSync(recovery);
	fs.copyFileSync(path.join(__dirname, "custody-stub.cjs"),
		path.join(runtime, "unix-install-custody.cjs"));
	fs.writeFileSync(core, "# B\"H — harmless fixture\n:\n");
	return { directory, runtime, recovery, core, marker };
}

/** Invoke the exact production guard, with one bounded process group. */
function runGuard(fixture, delay = 10) {
	return new Promise((resolve, reject) => {
		const args = [source, "guard", fixture.core, fixture.runtime,
			fixture.recovery, fixture.directory];
		const environment = { ...process.env, AWTSMOOS_TEST_SENTINEL: fixture.marker,
			AWTSMOOS_STUB_DELAY_MS: String(delay) };
		const child = spawn(process.execPath, args, {
			cwd: fixture.directory, env: environment, detached: true, stdio: "ignore"
		});
		let settled = false;
		const timer = setTimeout(() => {
			if (settled) return;
			try { process.kill(-child.pid, "SIGKILL"); } catch {}
		}, 6500);
		child.once("error", error => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			reject(error);
		});
		child.once("close", (code, signal) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve({ code, signal });
		});
	});
}

/** Count real delegated custody entries, never assumed admissions. */
function admissions(fixture) {
	try { return fs.readFileSync(fixture.marker, "utf8").trim().split("\n").length; }
	catch (error) { if (error.code === "ENOENT") return 0; throw error; }
}

/** Remove only fixture roots that this harness itself created. */
function cleanup(fixture) {
	if (!fixture.directory.startsWith(path.join(os.tmpdir(), "awtsmoos-guard-case-"))) {
		throw Error("guard_fixture_not_isolated");
	}
	fs.rmSync(fixture.directory, { recursive: true, force: true });
}
module.exports = { newCase, runGuard, admissions, cleanup, source };
