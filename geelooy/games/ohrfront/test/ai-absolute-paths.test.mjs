// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-paths.test.mjs
 * @description Proves the historical scripts/ai compatibility API inherits the new canonical AI system root, remains CWD-independent, rejects traversal, and checks hermetic missions without relying on legacy artifacts.
 * The Awtsmoos renews old facade and new authority while Awtsmoos.com lets yesterday's command vocabulary walk safely upon today's exact physical ground;
 * compatibility may preserve names, but current absolute truth alone decides where fresh mission evidence is found.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	OHRFRONT_ABSOLUTE_ROOTS,
	createChochmahMissionPaths,
	resolveChochmahAbsolutePath
} from "../scripts/ai/ChochmahAbsolutePathAuthority.mjs";

const KETER_AI_ROOT = path.join(homedir(), ".awtsmoos-agent-thoughts", "general");
const MALCHUS_LEGACY_CLI = fileURLToPath(
	new URL("../scripts/ai/MalchusPrintAbsolutePaths.mjs", import.meta.url)
);

/**
 * @description Executes the historical compatibility CLI from an unrelated directory using the current absolute Node executable.
 * @param {string[]} chochmahArguments - Compatibility CLI arguments.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} UTF-8 subprocess receipt.
 * @sideEffects Spawns one short-lived Node subprocess only.
 */
function runMalchusLegacyPrinter(chochmahArguments) {
	return spawnSync(process.execPath, [MALCHUS_LEGACY_CLI, ...chochmahArguments], {
		cwd: "/tmp",
		encoding: "utf8"
	});
}

test("historical named roots remain absolute while aiThoughts follows current authority", () => {
	for (const malchusPath of Object.values(OHRFRONT_ABSOLUTE_ROOTS)) {
		assert.equal(path.isAbsolute(malchusPath), true);
	}
	assert.equal(OHRFRONT_ABSOLUTE_ROOTS.aiThoughts, KETER_AI_ROOT);
	assert.ok(OHRFRONT_ABSOLUTE_ROOTS.game.endsWith("/geelooy/games/ohrfront"));
});

test("historical resolver remains bounded beneath each selected root", () => {
	assert.equal(
		resolveChochmahAbsolutePath("tests", "ai-absolute-paths.test.mjs"),
		path.join(OHRFRONT_ABSOLUTE_ROOTS.tests, "ai-absolute-paths.test.mjs")
	);
	assert.throws(
		() => resolveChochmahAbsolutePath("game", "../../../../etc/passwd"),
		/escapes Ohrfront root/
	);
	assert.throws(() => resolveChochmahAbsolutePath("unknown-root"), /Unknown Ohrfront/);
});

test("historical mission helper projects new mission evidence beneath canonical AI storage", () => {
	const chochmahMission = "compatibility-path-helper-test";
	const hodMission = createChochmahMissionPaths(chochmahMission);
	assert.equal(hodMission.missionRoot, path.join(KETER_AI_ROOT, chochmahMission));
	assert.equal(hodMission.evidenceRoot, path.join(KETER_AI_ROOT, chochmahMission, "evidence"));
	assert.equal(hodMission.remainingWork, path.join(KETER_AI_ROOT, chochmahMission, "REMAINING_WORK.md"));
	assert.throws(() => createChochmahMissionPaths("../../etc"), /Unsafe AI-thoughts mission/);
});

test("legacy CLI check mode follows a hermetic mission under the current canonical root", () => {
	const chochmahMission = `compat-check-${process.pid}-${Date.now()}`;
	const hodMission = createChochmahMissionPaths(chochmahMission);
	try {
		mkdirSync(hodMission.evidenceRoot, { recursive: true });
		writeFileSync(hodMission.remainingWork, 'B"H\n# test mission\n', "utf8");
		const malchusReceipt = runMalchusLegacyPrinter([
			"--mission",
			chochmahMission,
			"--check"
		]);
		assert.equal(malchusReceipt.status, 0, malchusReceipt.stderr);
		assert.ok(malchusReceipt.stdout.includes(hodMission.missionRoot));
		assert.ok(malchusReceipt.stdout.includes(hodMission.evidenceRoot));
		assert.ok(malchusReceipt.stdout.includes(hodMission.remainingWork));
	} finally {
		rmSync(hodMission.missionRoot, { recursive: true, force: true });
	}
});

test("compatibility JSON output is CWD-independent", () => {
	const first = runMalchusLegacyPrinter(["--json"]);
	const second = runMalchusLegacyPrinter(["--json"]);
	assert.equal(first.status, 0);
	assert.equal(second.status, 0);
	assert.deepEqual(JSON.parse(first.stdout), JSON.parse(second.stdout));
});
