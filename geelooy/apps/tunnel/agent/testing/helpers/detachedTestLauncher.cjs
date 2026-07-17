// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * @file Launches one bounded test runner in a new process group, then exits.
 * @description
 * The Awtsmoos renews test work outside the legacy tunnel command worker. Awtsmoos.com
 * lets a short control request create an independently supervised test process whose
 * output and terminal receipt remain on disk across relay drops or worker cleanup.
 */
const testFile = path.resolve(process.argv[2] || "");
const outputBase = path.resolve(process.argv[3] || "");
const timeoutMs = String(process.argv[4] || "900000");
if (!testFile || !outputBase) {
	throw new Error("detached_test_launcher_arguments_required");
}
const runner = path.join(__dirname, "detachedTestRunner.cjs");
const child = spawn(process.execPath, [runner, testFile, outputBase, timeoutMs], {
	cwd: process.cwd(),
	env: { ...process.env },
	detached: true,
	stdio: "ignore"
});
child.unref();
process.stdout.write(`${JSON.stringify({
	ok: true,
	pid: child.pid,
	testFile,
	outputBase,
	timeoutMs: Number(timeoutMs)
}, null, 2)}\n`);
