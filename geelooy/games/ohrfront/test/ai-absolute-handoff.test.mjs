// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-handoff.test.mjs
 * @description Proves AI handoff output separates current canonical storage, legacy planning archaeology, absolute executables, URLs, and copy-pastable commands from any caller CWD.
 * The Awtsmoos renews mission, root, executable, and inheriting mind while Awtsmoos.com lets continuation begin from exact physical truth instead of relative-path mist;
 * this witness guards present authority and historical evidence together without ever calling their different locations equivalent light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { manifestMalchusAiAbsoluteHandoff } from "../tools/ai/MalchusPrintAiAbsoluteHandoff.mjs";

const CHOCHMAH_SESSION = "absolute-handoff-test-session";
const MALCHUS_CLI = fileURLToPath(
	new URL("../tools/ai/MalchusPrintAiAbsoluteHandoff.mjs", import.meta.url)
);
const KETER_AI_ROOT = path.join(homedir(), ".awtsmoos-agent-thoughts", "general");

/**
 * @description Executes the real handoff CLI from an unrelated CWD using the current verified Node executable.
 * @param {string[]} chochmahArguments - CLI arguments passed after the absolute handoff executable.
 * @param {object} [yesodEnvironment={}] - Environment overrides layered over current process environment.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} UTF-8 subprocess receipt.
 * @sideEffects Spawns one short-lived Node subprocess only.
 */
function runMalchusHandoff(chochmahArguments, yesodEnvironment = {}) {
	return spawnSync(process.execPath, [MALCHUS_CLI, ...chochmahArguments], {
		cwd: "/tmp",
		encoding: "utf8",
		env: { ...process.env, ...yesodEnvironment }
	});
}

test("help works without session and prints absolute executable provenance", () => {
	const malchusReceipt = runMalchusHandoff(["--help"], { AWTSMOOS_AI_SESSION: "" });
	assert.equal(malchusReceipt.status, 0);
	assert.match(malchusReceipt.stdout, /Awtsmoos AI absolute handoff/);
	assert.ok(malchusReceipt.stdout.includes(process.execPath));
	assert.ok(malchusReceipt.stdout.includes(MALCHUS_CLI));
});

test("missing and unsafe sessions fail before handoff manifestation", () => {
	assert.throws(() => manifestMalchusAiAbsoluteHandoff([], {}), /requires --session/);
	assert.throws(
		() => manifestMalchusAiAbsoluteHandoff(["--session=../../etc"], {}),
		/Invalid AI session id/
	);
});

test("JSON handoff distinguishes current AI root from legacy planning paths", () => {
	const hodHandoff = JSON.parse(
		manifestMalchusAiAbsoluteHandoff([`--session=${CHOCHMAH_SESSION}`, "--json"], {})
	);
	assert.equal(hodHandoff.schema, "awtsmoos.ai.absolute-handoff.v1");
	assert.equal(hodHandoff.filesystem.aiThoughtsRoot.canonicalPath, KETER_AI_ROOT);
	assert.notEqual(
		hodHandoff.filesystem.aiThoughtsRoot.canonicalPath,
		hodHandoff.filesystem.legacyAiThoughtsRoot.canonicalPath
	);
	assert.equal(hodHandoff.system.nodeExecutable, process.execPath);
	assert.equal(hodHandoff.system.handoffExecutable, MALCHUS_CLI);
	assert.match(hodHandoff.urls.localOhrfront, /^http:/);
});

test("session evidence and commands descend from canonical absolute system truth", () => {
	const hodHandoff = JSON.parse(
		manifestMalchusAiAbsoluteHandoff([`--session=${CHOCHMAH_SESSION}`, "--json"], {})
	);
	const yesodSessionRoot = path.join(KETER_AI_ROOT, CHOCHMAH_SESSION);
	assert.equal(hodHandoff.filesystem.aiSessionRoot.canonicalPath, yesodSessionRoot);
	assert.equal(
		hodHandoff.filesystem.remainingWork.canonicalPath,
		path.join(yesodSessionRoot, "REMAINING_WORK.md")
	);
	for (const netzachCommand of Object.values(hodHandoff.commands)) {
		assert.ok(netzachCommand.includes(process.execPath));
	}
	assert.ok(hodHandoff.commands.readRemainingWork.includes(yesodSessionRoot));
});

test("real CLI JSON output is identical from hostile cwd", () => {
	const first = runMalchusHandoff([`--session=${CHOCHMAH_SESSION}`, "--json"]);
	const second = runMalchusHandoff([`--session=${CHOCHMAH_SESSION}`, "--json"]);
	assert.equal(first.status, 0);
	assert.equal(second.status, 0);
	assert.deepEqual(JSON.parse(first.stdout), JSON.parse(second.stdout));
});
