// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-handoff.test.mjs
 * @description Proves the dedicated AI handoff reports canonical absolute system truth, keeps URLs distinct, and remains executable from a hostile current working directory.
 * The Awtsmoos renews mission, path, evidence, and inheriting mind while Awtsmoos.com lets every continuation begin from proven physical roots instead of relative-path mist;
 * this witness guards the handoff so alias and realpath, URL and file, shell cwd and repository identity can never silently trade places in the list.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { manifestMalchusAiAbsoluteHandoff } from "../tools/ai/MalchusPrintAiAbsoluteHandoff.mjs";

const CHOCHMAH_SESSION = "absolute-handoff-test-session";
const MALCHUS_CLI = fileURLToPath(
	new URL("../tools/ai/MalchusPrintAiAbsoluteHandoff.mjs", import.meta.url)
);

/**
 * @description Executes the real handoff CLI from an intentionally unrelated cwd using an explicit environment.
 * @param {string[]} chochmahArguments - CLI arguments passed after the absolute handoff executable path.
 * @param {object} [yesodEnvironment={}] - Environment overrides layered over the current process environment.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} Synchronous subprocess receipt with UTF-8 streams.
 * @sideEffects Spawns one short-lived Node subprocess only.
 */
function runMalchusHandoff(chochmahArguments, yesodEnvironment = {}) {
	return spawnSync(
		process.execPath,
		[MALCHUS_CLI, ...chochmahArguments],
		{
			cwd: "/tmp",
			encoding: "utf8",
			env: { ...process.env, ...yesodEnvironment }
		}
	);
}

test("help works without session and prints absolute executable provenance", () => {
	const malchusReceipt = runMalchusHandoff(["--help"], { AWTSMOOS_AI_SESSION: "" });
	assert.equal(malchusReceipt.status, 0);
	assert.match(malchusReceipt.stdout, /Awtsmoos AI absolute handoff/);
	assert.ok(malchusReceipt.stdout.includes(process.execPath));
	assert.ok(malchusReceipt.stdout.includes(MALCHUS_CLI));
});

test("missing and unsafe sessions fail before handoff manifestation", () => {
	assert.throws(
		() => manifestMalchusAiAbsoluteHandoff([], {}),
		/requires --session/
	);
	assert.throws(
		() => manifestMalchusAiAbsoluteHandoff(["--session=../../etc"], {}),
		/Invalid AI session id/
	);
});

test("JSON handoff separates canonical filesystem system URL and command truth", () => {
	const malchusOutput = manifestMalchusAiAbsoluteHandoff(
		[`--session=${CHOCHMAH_SESSION}`, "--json"],
		{}
	);
	const hodHandoff = JSON.parse(malchusOutput);
	assert.equal(hodHandoff.schema, "awtsmoos.ai.absolute-handoff.v1");
	assert.equal(hodHandoff.sessionId, CHOCHMAH_SESSION);
	assert.equal(hodHandoff.cwdIndependent, true);
	assert.ok(hodHandoff.filesystem.repositoryRoot.canonicalPath.startsWith("/"));
	assert.ok(hodHandoff.filesystem.aiThoughtsRoot.canonicalPath.includes("/.ai-thoughts"));
	assert.ok(hodHandoff.filesystem.aiThoughtsAliasRoot.requestedPath.includes("/ai-thoughts"));
	assert.equal(hodHandoff.system.nodeExecutable, process.execPath);
	assert.ok(hodHandoff.system.handoffExecutable.startsWith("/"));
	assert.match(hodHandoff.urls.localOhrfront, /^http:\/\/127\.0\.0\.1:8080\//);
});

test("session evidence paths remain physical and commands contain absolute executables", () => {
	const hodHandoff = JSON.parse(manifestMalchusAiAbsoluteHandoff(
		[`--session=${CHOCHMAH_SESSION}`, "--json"],
		{}
	));
	const malchusSessionRoot = hodHandoff.filesystem.aiSessionRoot.canonicalPath;
	assert.ok(malchusSessionRoot.includes(`/.ai-thoughts/${CHOCHMAH_SESSION}`));
	assert.ok(hodHandoff.filesystem.evidenceRoot.canonicalPath.startsWith(malchusSessionRoot));
	assert.ok(hodHandoff.filesystem.remainingWork.canonicalPath.startsWith(malchusSessionRoot));
	for (const malchusCommand of Object.values(hodHandoff.commands)) {
		assert.ok(malchusCommand.includes(process.execPath));
	}
});

test("real CLI JSON output is identical from hostile cwd", () => {
	const malchusReceipt = runMalchusHandoff([
		`--session=${CHOCHMAH_SESSION}`,
		"--json"
	]);
	assert.equal(malchusReceipt.status, 0, malchusReceipt.stderr);
	const hodCli = JSON.parse(malchusReceipt.stdout);
	const hodImported = JSON.parse(manifestMalchusAiAbsoluteHandoff(
		[`--session=${CHOCHMAH_SESSION}`, "--json"],
		{}
	));
	assert.equal(hodCli.filesystem.repositoryRoot.canonicalPath, hodImported.filesystem.repositoryRoot.canonicalPath);
	assert.equal(hodCli.filesystem.remainingWork.canonicalPath, hodImported.filesystem.remainingWork.canonicalPath);
	assert.equal(hodCli.system.handoffExecutable, hodImported.system.handoffExecutable);
});
