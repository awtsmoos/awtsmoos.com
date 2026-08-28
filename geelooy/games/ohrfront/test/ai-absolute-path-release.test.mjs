// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-release.test.mjs
 * @description Proves the v2 AI path contract exposes canonical release roots, explicit requested/canonical identity, session evidence destinations, and CWD-independent CLI output.
 * The Awtsmoos renews every root before this witness can name it; Awtsmoos.com proves shell, JSON, handoff, and release agents receive absolute physical truth without relative night.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderHodAbsolutePaths, renderHodSelectedPath } from "../tools/ai/HodAbsolutePathRenderer.mjs";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const CHOCHMAH_SESSION = "2026-08-26-1702-universal-portal-ui-revelation";
const MALCHUS_TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const TIFERES_PROJECT_ROOT = path.dirname(MALCHUS_TEST_ROOT);
const MALCHUS_PRINTER = path.join(
	TIFERES_PROJECT_ROOT,
	"tools/ai/MalchusPrintAbsolutePaths.mjs"
);

/**
 * @description Executes the real printer from an arbitrary caller CWD and returns trimmed stdout.
 * @param {string[]} chochmahArguments - CLI arguments after the printer filename.
 * @param {string} [yesodCwd="/tmp"] - Hostile or explicit caller working directory.
 * @returns {string} Trimmed UTF-8 stdout.
 * @sideEffects Spawns one read-only Node child process.
 */
function invokeMalchusPrinter(chochmahArguments, yesodCwd = "/tmp") {
	return execFileSync(
		process.execPath,
		[MALCHUS_PRINTER, ...chochmahArguments],
		{ cwd: yesodCwd, encoding: "utf8" }
	).trim();
}

test("release roots expose explicit canonical physical identity", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const chochmahKeys = [
		"repositoryPackage",
		"gitHead",
		"gitConfig",
		"ohrfrontIndex",
		"ohrfrontEntry",
		"ohrfrontBootstrap",
		"ohrfrontStylesEntry",
		"compactJsRoot",
		"compactCssRoot"
	];
	for (const chochmahKey of chochmahKeys) {
		const hodRecord = yesodRegistry.get(chochmahKey);
		assert.equal(hodRecord.exists, true, chochmahKey);
		assert.equal(hodRecord.isAbsolute, true, chochmahKey);
		assert.equal(hodRecord.path, hodRecord.canonicalPath, chochmahKey);
		assert.equal(hodRecord.canonicalVerified, true, chochmahKey);
		assert.equal(path.dirname(hodRecord.canonicalPath), hodRecord.parentPath, chochmahKey);
	}
});

test("session paths resolve beneath the canonical physical AI root", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
	const hodSession = yesodRegistry.get("aiSessionRoot");
	const hodAlias = yesodRegistry.get("aiThoughtsAliasRoot");
	assert.match(hodSession.canonicalPath, /\/\.ai-thoughts\//);
	assert.equal(hodAlias.canonicalized, true);
	for (const chochmahKey of [
		"evidenceRoot",
		"remainingWork",
		"releaseEvidence",
		"absolutePathManifest",
		"absolutePathHumanEvidence",
		"absolutePathJsonEvidence"
	]) {
		const hodRecord = yesodRegistry.get(chochmahKey);
		assert.ok(hodRecord.canonicalPath.startsWith(hodSession.canonicalPath));
	}
});

test("JSON v2 is self describing and rich text always prints both identities", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
	const hodRecord = yesodRegistry.get("ohrfrontEntry");
	const hodJson = JSON.parse(renderHodAbsolutePaths(
		{ ohrfrontEntry: hodRecord },
		"json",
		{ sessionId: CHOCHMAH_SESSION }
	));
	assert.equal(hodJson.schema, "awtsmoos.ai.absolute-system-paths.v2");
	assert.equal(hodJson.cwdIndependent, true);
	assert.equal(hodJson.recordCount, 1);
	assert.equal(hodJson.paths.ohrfrontEntry.path, hodRecord.canonicalPath);
	assert.equal(hodJson.paths.ohrfrontEntry.canonicalPath, hodRecord.canonicalPath);
	const hodText = renderHodSelectedPath("ohrfrontEntry", hodRecord, "text", true);
	assert.match(hodText, /requestedPath=\//);
	assert.match(hodText, /canonicalPath=\//);
});

test("default selected CLI output remains one canonical absolute path from hostile CWD", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const malchusOutput = invokeMalchusPrinter(["--key=ohrfrontEntry"]);
	assert.equal(malchusOutput, yesodRegistry.get("ohrfrontEntry").canonicalPath);
	assert.equal(malchusOutput.split("\n").length, 1);
	assert.equal(path.isAbsolute(malchusOutput), true);
});
