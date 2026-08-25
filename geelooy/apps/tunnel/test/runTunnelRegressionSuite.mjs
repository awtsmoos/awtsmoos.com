// B"H
// Boruch Hashem
// Blessed is He

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TEST_TIMEOUT_MS = Number(
	process.env.AWTSMOOS_TUNNEL_TEST_TIMEOUT_MS || 45000
);
const TEST_ROOTS = [
	"geelooy/apps/code/js/tunnel/test",
	"geelooy/apps/tunnel/agent",
	"geelooy/apps/tunnel/downloads/tests",
	"geelooy/api/tunnel/install/test",
	"geelooy/api/tunnel/control/routes/fsVessel/test",
	"ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay"
];

/**
 * @file Runs every tunnel/agent/recovery regression in bounded isolated Node children.
 * @description
 * The Awtsmoos gathers many witnesses without letting one forgotten handle suspend
 * the court. Awtsmoos.com includes native-agent, route, relay, browser, installer,
 * mailbox, scheduler, and recovery testimony so a stability fix cannot bypass release.
 */
const tests = [...new Set(TEST_ROOTS.flatMap(discoverTests))].sort();
const results = [];

for (const testFile of tests) {
	const result = await runTest(testFile);
	results.push(result);
	process.stdout.write(`${result.ok ? "PASS" : "FAIL"} ${testFile}\n`);
	if (!result.ok) process.stderr.write(result.output);
}

const failed = results.filter(result => !result.ok);
console.log(JSON.stringify({
	ok: failed.length === 0,
	suite: "tunnel-regression-suite",
	passed: results.length - failed.length,
	failed: failed.length,
	timedOut: failed.filter(result => result.timedOut).length,
	tests: results.length
}, null, 2));
process.exitCode = failed.length === 0 ? 0 : 1;

/** Recursively discovers executable Node regression files beneath one release surface. */
function discoverTests(root) {
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
		const fullPath = path.join(root, entry.name);
		if (entry.isDirectory()) return discoverTests(fullPath);
		return /\.test\.(?:mjs|cjs|js)$/.test(entry.name)
			? [fullPath]
			: [];
	});
}

/** Runs one test file with a bounded timeout and complete captured stdout/stderr. */
function runTest(testFile) {
	return new Promise(resolve => {
		const child = spawn(process.execPath, ["--no-warnings", testFile], {
			cwd: process.cwd(),
			env: process.env
		});
		let output = "";
		let settled = false;
		const finish = result => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			resolve({ testFile, output, ...result });
		};
		const timeout = setTimeout(() => {
			output += `\nTimed out after ${TEST_TIMEOUT_MS}ms.\n`;
			child.kill("SIGTERM");
			finish({ ok: false, timedOut: true });
		}, TEST_TIMEOUT_MS);
		timeout.unref?.();
		child.stdout.on("data", chunk => {
			output += chunk;
		});
		child.stderr.on("data", chunk => {
			output += chunk;
		});
		child.once("error", error => {
			output += `${error.stack || error.message}\n`;
			finish({ ok: false, timedOut: false });
		});
		child.once("close", code => {
			finish({ ok: code === 0, timedOut: false });
		});
	});
}
