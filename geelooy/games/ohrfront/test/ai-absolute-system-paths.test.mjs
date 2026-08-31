// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-system-paths.test.mjs
 * @description Proves current AI storage, legacy symlink archaeology, future session targets, and hostile-CWD CLI output expose canonical absolute system truth rather than merely absolute-looking strings.
 * The Awtsmoos renews home, symlink, inode, mission, and executable while Awtsmoos.com lets physical identity answer every ambiguity with measured light;
 * current storage stands unsymlinked, legacy aliases reveal their history, and future evidence receives one canonical place before it is written in sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MALCHUS_CLI = fileURLToPath(
	new URL("../tools/ai/MalchusPrintAbsolutePaths.mjs", import.meta.url)
);
const KETER_AI_ROOT = path.join(homedir(), ".awtsmoos-agent-thoughts", "general");

/**
 * @description Executes the canonical path printer from `/tmp` using the current process's absolute Node executable.
 * @param {string[]} chochmahArguments - CLI arguments passed to the printer.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} UTF-8 subprocess receipt.
 * @sideEffects Spawns one short-lived Node subprocess only.
 */
function runMalchusPrinter(chochmahArguments) {
	return spawnSync(process.execPath, [MALCHUS_CLI, ...chochmahArguments], {
		cwd: "/tmp",
		encoding: "utf8"
	});
}

test("current AI root system evidence is canonical verified and not a symlink", () => {
	const malchusReceipt = runMalchusPrinter(["--key=aiThoughtsRoot", "--format=system"]);
	assert.equal(malchusReceipt.status, 0);
	assert.match(malchusReceipt.stdout, new RegExp(`canonicalPath=${KETER_AI_ROOT}`));
	assert.match(malchusReceipt.stdout, /requestedIsSymlink=false/);
	assert.match(malchusReceipt.stdout, /canonicalVerified=true/);
	assert.match(malchusReceipt.stdout, /inode=\d+/);
	assert.match(malchusReceipt.stdout, /device=\d+/);
});

test("legacy human alias remains a symlink to historical hidden work storage", () => {
	const malchusReceipt = runMalchusPrinter(["--key=aiThoughtsAliasRoot", "--format=system"]);
	assert.equal(malchusReceipt.status, 0);
	assert.match(malchusReceipt.stdout, /requestedPath=\/Users\/awtsmoos\/work\/ai-thoughts/);
	assert.match(malchusReceipt.stdout, /canonicalPath=\/Users\/awtsmoos\/work\/\.ai-thoughts/);
	assert.match(malchusReceipt.stdout, /requestedIsSymlink=true/);
	assert.match(malchusReceipt.stdout, /canonicalized=true/);
});

test("future remaining-work path is canonical under current session storage before creation", () => {
	const chochmahSession = "absolute-system-future-session";
	const malchusReceipt = runMalchusPrinter([
		`--session=${chochmahSession}`,
		"--key=remainingWork",
		"--format=json"
	]);
	assert.equal(malchusReceipt.status, 0);
	const hodEnvelope = JSON.parse(malchusReceipt.stdout);
	const hodRecord = hodEnvelope.paths.remainingWork;
	assert.equal(
		hodRecord.canonicalPath,
		path.join(KETER_AI_ROOT, chochmahSession, "REMAINING_WORK.md")
	);
	assert.equal(hodRecord.primaryScope, "ai-session");
	assert.deepEqual(hodRecord.scopes.slice(0, 2), ["ai-session", "ai-thoughts"]);
	assert.equal(hodRecord.relativeToSession, "REMAINING_WORK.md");
});

test("single-key default output is the bare canonical AI root from hostile cwd", () => {
	const malchusReceipt = runMalchusPrinter(["--key=aiThoughtsRoot"]);
	assert.equal(malchusReceipt.status, 0);
	assert.equal(malchusReceipt.stdout.trim(), KETER_AI_ROOT);
	assert.equal(path.isAbsolute(malchusReceipt.stdout.trim()), true);
});
