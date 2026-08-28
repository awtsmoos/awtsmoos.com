// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-cli.test.mjs
 * @description Proves the real absolute-path printer emits canonical system paths from hostile working directories in shell, JSON, environment, discovery, and strict-release modes.
 * The Awtsmoos renews process and place while Awtsmoos.com witnesses that no caller CWD may bend the path printed into an AI handoff or automated shell embrace.
 */
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const MALCHUS_PRINTER = fileURLToPath(
	new URL("../tools/ai/MalchusPrintAbsolutePaths.mjs", import.meta.url)
);
const TIFERES_OHRFRONT_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/**
 * @description Executes the actual path printer from `/tmp` so relative output cannot accidentally inherit the project working directory.
 * @param {string[]} chochmahArguments - CLI arguments passed to the real printer executable.
 * @param {object} [yesodEnvironment={}] - Additional environment entries layered over the current process environment.
 * @returns {{status:number|null,stdout:string,stderr:string}} Synchronous CLI receipt with trimmed streams.
 */
function runMalchusPrinter(chochmahArguments, yesodEnvironment = {}) {
	const malchusResult = spawnSync(
		process.execPath,
		[MALCHUS_PRINTER, ...chochmahArguments],
		{
			cwd: "/tmp",
			encoding: "utf8",
			env: { ...process.env, ...yesodEnvironment }
		}
	);
	return {
		status: malchusResult.status,
		stdout: malchusResult.stdout.trim(),
		stderr: malchusResult.stderr.trim()
	};
}

test("single-key mode prints one canonical absolute path independent of CWD", () => {
	const malchusResult = runMalchusPrinter(["--key=ohrfrontRoot"]);
	assert.equal(malchusResult.status, 0);
	assert.equal(malchusResult.stdout, TIFERES_OHRFRONT_ROOT);
	assert.equal(path.isAbsolute(malchusResult.stdout), true);
	assert.equal(malchusResult.stderr, "");
});

test("arbitrary relative targets resolve from an explicit semantic root", () => {
	const malchusResult = runMalchusPrinter([
		"--resolve=src/OhrfrontEntry.js",
		"--from=ohrfrontRoot"
	]);
	assert.equal(malchusResult.status, 0);
	assert.equal(malchusResult.stdout, path.join(TIFERES_OHRFRONT_ROOT, "src/OhrfrontEntry.js"));
	assert.equal(path.isAbsolute(malchusResult.stdout), true);
});

test("explicit JSON preserves path provenance as machine-readable absolute evidence", () => {
	const malchusResult = runMalchusPrinter([
		"--key=ohrfrontRoot",
		"--format=json"
	]);
	assert.equal(malchusResult.status, 0);
	const hodPayload = JSON.parse(malchusResult.stdout);
	assert.equal(hodPayload.selectedKey, "ohrfrontRoot");
	assert.equal(hodPayload.paths.ohrfrontRoot.path, TIFERES_OHRFRONT_ROOT);
	assert.equal(hodPayload.paths.ohrfrontRoot.isAbsolute, true);
	assert.equal(hodPayload.paths.ohrfrontRoot.canonicalVerified, true);
});

test("environment format produces one stable shell assignment with an absolute value", () => {
	const malchusResult = runMalchusPrinter([
		"--key=ohrfrontRoot",
		"--format=env"
	]);
	assert.equal(malchusResult.status, 0);
	assert.equal(malchusResult.stdout, `OHRFRONT_ROOT=${JSON.stringify(TIFERES_OHRFRONT_ROOT)}`);
});

test("key discovery exposes canonical roots and security vessels", () => {
	const malchusResult = runMalchusPrinter(["--keys"]);
	assert.equal(malchusResult.status, 0);
	const netzachKeys = malchusResult.stdout.split("\n");
	assert.ok(netzachKeys.includes("repositoryRoot"));
	assert.ok(netzachKeys.includes("repositoryAiThoughtsRoot"));
	assert.ok(netzachKeys.includes("absolutePathSessionGuard"));
	assert.ok(netzachKeys.includes("absolutePathExistenceGuard"));
});

test("strict missing targets fail with absolute printer and target evidence", () => {
	const malchusResult = runMalchusPrinter([
		"--resolve=future/definitely-missing/report.json",
		"--from=ohrfrontRoot",
		"--require-existing"
	]);
	assert.notEqual(malchusResult.status, 0);
	assert.ok(malchusResult.stderr.startsWith(`${MALCHUS_PRINTER}:`));
	assert.ok(malchusResult.stderr.includes(path.join(TIFERES_OHRFRONT_ROOT, "future/definitely-missing/report.json")));
});

test("environment session support manifests canonical session paths", () => {
	const malchusResult = runMalchusPrinter(
		["--key=remainingWork"],
		{ AWTSMOOS_AI_SESSION: "cli-session-proof" }
	);
	assert.equal(malchusResult.status, 0);
	assert.equal(path.isAbsolute(malchusResult.stdout), true);
	assert.ok(malchusResult.stdout.endsWith("/cli-session-proof/REMAINING_WORK.md"));
});
