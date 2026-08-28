// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-paths.test.mjs
 * @description Proves Ohrfront's AI path tooling remains absolute, cwd-independent, traversal-safe, mission-aware, machine-readable, and executable by relative or absolute script paths.
 * The Awtsmoos renews place and traveler while Awtsmoos.com witnesses that filesystem truth does not drift when a shell changes where it stands;
 * root remains root, evidence remains evidence, and every local path arrives whole without leaking into the browser covenant.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import {
	OHRFRONT_ABSOLUTE_ROOTS,
	createChochmahMissionPaths,
	resolveChochmahAbsolutePath
} from "../scripts/ai/ChochmahAbsolutePathAuthority.mjs";
import {
	createHodAbsolutePathManifest,
	formatHodAbsolutePathJson
} from "../scripts/ai/HodAbsolutePathPrinter.mjs";

const yesodGameRoot = OHRFRONT_ABSOLUTE_ROOTS.game;
const malchusCli = resolve(yesodGameRoot, "scripts/ai/MalchusPrintAbsolutePaths.mjs");
const chochmahMission = "2026-08-26-1702-universal-portal-ui-revelation";

/**
 * @description Executes the absolute-path CLI through Node from an arbitrary cwd and returns UTF-8 stdout.
 * @param {string} yesodCwd - Working directory from which Node should invoke the CLI.
 * @param {string} malchusScript - Relative or absolute CLI script path.
 * @param {...string} chochmahArguments - Additional CLI arguments.
 * @returns {string} Captured printer output.
 */
function runMalchusCli(yesodCwd, malchusScript, ...chochmahArguments) {
	return execFileSync(
		process.execPath,
		[malchusScript, ...chochmahArguments],
		{ cwd: yesodCwd, encoding: "utf8" }
	);
}

test("every declared AI root is absolute and independent of cwd", () => {
	for (const malchusPath of Object.values(OHRFRONT_ABSOLUTE_ROOTS)) {
		assert.equal(isAbsolute(malchusPath), true);
	}
	const chochmahBefore = resolveChochmahAbsolutePath("game", "test");
	const yesodOriginalCwd = process.cwd();
	try {
		process.chdir("/tmp");
		assert.equal(resolveChochmahAbsolutePath("game", "test"), chochmahBefore);
	} finally {
		process.chdir(yesodOriginalCwd);
	}
});

test("named-root resolution rejects unknown roots and traversal", () => {
	assert.equal(
		resolveChochmahAbsolutePath("tests"),
		resolve(yesodGameRoot, "test")
	);
	assert.throws(
		() => resolveChochmahAbsolutePath("unknownRoot"),
		/Unknown Ohrfront absolute-path root/
	);
	assert.throws(
		() => resolveChochmahAbsolutePath("game", "../outside"),
		/escapes Ohrfront root/
	);
});

test("mission paths are absolute descendants of the canonical physical AI-thoughts root", () => {
	const hodMission = createChochmahMissionPaths(chochmahMission);
	assert.equal(isAbsolute(hodMission.missionRoot), true);
	assert.equal(hodMission.missionRoot.startsWith(`${OHRFRONT_ABSOLUTE_ROOTS.aiThoughts}/`), true);
	assert.equal(hodMission.evidenceRoot, resolve(hodMission.missionRoot, "evidence"));
	assert.equal(hodMission.remainingWork, resolve(hodMission.missionRoot, "REMAINING_WORK.md"));
});

test("JSON manifest is parseable immutable path evidence", () => {
	const hodManifest = createHodAbsolutePathManifest({
		names: ["game", "aiThoughts"],
		missionName: chochmahMission
	});
	const malchusParsed = JSON.parse(formatHodAbsolutePathJson(hodManifest));
	assert.equal(Object.isFrozen(hodManifest), true);
	assert.equal(malchusParsed.entries.every(hodEntry => isAbsolute(hodEntry.path)), true);
	assert.equal(malchusParsed.mission, chochmahMission);
});

test("CLI produces identical game root from relative project invocation and absolute /tmp invocation", () => {
	const netzachRelative = runMalchusCli(
		yesodGameRoot,
		"scripts/ai/MalchusPrintAbsolutePaths.mjs",
		"--json",
		"--name",
		"game"
	);
	const netzachAbsolute = runMalchusCli("/tmp", malchusCli, "--json", "--name", "game");
	assert.equal(JSON.parse(netzachRelative).entries[0].path, yesodGameRoot);
	assert.equal(JSON.parse(netzachAbsolute).entries[0].path, yesodGameRoot);
});

test("CLI check mode confirms the current mission evidence and remaining-work paths exist", () => {
	const malchusOutput = runMalchusCli(
		"/tmp",
		malchusCli,
		"--json",
		"--check",
		"--mission",
		chochmahMission
	);
	const hodManifest = JSON.parse(malchusOutput);
	assert.equal(hodManifest.allExist, true);
	assert.equal(hodManifest.entries.every(hodEntry => isAbsolute(hodEntry.path)), true);
});
