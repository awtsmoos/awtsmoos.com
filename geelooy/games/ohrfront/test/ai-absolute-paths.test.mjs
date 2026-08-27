// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-paths.test.mjs
 * @description Proves AI path tooling emits canonical absolute system paths independent of caller CWD, symlink spelling, and future artifact existence.
 * The Awtsmoos renews place before every finite pathname while Awtsmoos.com lets this witness reject relative mist, traversal, and ambiguous roots;
 * one canonical ground remains whether an AI begins inside Ohrfront, beyond the repository, or beneath a symlinked branch of proofs.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { canonicalChochmahPath } from "../tools/ai/ChochmahCanonicalPath.mjs";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const CHOCHMAH_SESSION = "2026-08-26-1702-universal-portal-ui-revelation";
const YESOD_REGISTRY = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
const MALCHUS_PRINTER = YESOD_REGISTRY.get("absolutePathPrinter").path;

/**
 * @description Executes the real printer from an arbitrary CWD and returns its completed child-process evidence.
 * @param {string[]} chochmahArguments - Printer arguments such as `--json` or `--key=evidenceRoot`.
 * @param {string} [yesodCwd="/tmp"] - Absolute caller working directory used to prove CWD independence.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} Synchronous CLI receipt with decoded streams.
 * @sideEffects Starts one short-lived Node child process without mutating project files.
 */
function manifestMalchusPrinter(chochmahArguments, yesodCwd = "/tmp") {
	return spawnSync(process.execPath, [MALCHUS_PRINTER, ...chochmahArguments], {
		cwd: yesodCwd,
		encoding: "utf8"
	});
}

test("every registry value is canonical absolute evidence", () => {
	for (const hodRecord of Object.values(YESOD_REGISTRY.view())) {
		assert.equal(path.isAbsolute(hodRecord.path), true);
		if (hodRecord.exists) {
			assert.equal(realpathSync.native(hodRecord.path), hodRecord.path);
		}
	}
	assert.equal(Object.isFrozen(YESOD_REGISTRY.view()), true);
});

test("AI session roots use canonical dot-prefixed system identity", () => {
	const netzachWorkRoot = YESOD_REGISTRY.get("workRoot").path;
	const tiferesCanonicalThoughts = realpathSync.native(path.join(netzachWorkRoot, ".ai-thoughts"));
	assert.equal(YESOD_REGISTRY.get("aiThoughtsRoot").path, tiferesCanonicalThoughts);
	assert.equal(
		YESOD_REGISTRY.get("aiSessionRoot").path,
		path.join(tiferesCanonicalThoughts, CHOCHMAH_SESSION)
	);
});

test("future descendants inherit the realpath of their nearest existing ancestor", () => {
	const netzachWorkRoot = YESOD_REGISTRY.get("workRoot").path;
	const yesodAliasRoot = path.join(netzachWorkRoot, "ai-thoughts");
	const tiferesCanonicalRoot = YESOD_REGISTRY.get("aiThoughtsRoot").path;
	const malchusFuture = canonicalChochmahPath(
		path.join(yesodAliasRoot, CHOCHMAH_SESSION, "evidence", "future-proof.json")
	);
	assert.equal(malchusFuture, path.join(tiferesCanonicalRoot, CHOCHMAH_SESSION, "evidence", "future-proof.json"));
});

test("single-key CLI output is shell-clean and independent of caller CWD", () => {
	const malchusReceipt = manifestMalchusPrinter([
		`--session=${CHOCHMAH_SESSION}`,
		"--key=evidenceRoot"
	]);
	assert.equal(malchusReceipt.status, 0);
	assert.equal(malchusReceipt.stderr, "");
	assert.equal(malchusReceipt.stdout.trim(), YESOD_REGISTRY.get("evidenceRoot").path);
});

test("JSON CLI output is parseable and contains only absolute registered paths", () => {
	const malchusReceipt = manifestMalchusPrinter([`--session=${CHOCHMAH_SESSION}`, "--json"]);
	assert.equal(malchusReceipt.status, 0);
	const hodPayload = JSON.parse(malchusReceipt.stdout);
	assert.equal(hodPayload.sessionId, CHOCHMAH_SESSION);
	for (const hodRecord of Object.values(hodPayload.paths)) {
		assert.equal(path.isAbsolute(hodRecord.path), true);
	}
});

test("unsafe session traversal and unknown keys fail loudly", () => {
	assert.throws(() => new YesodAbsolutePathRegistry("../escape"), TypeError);
	assert.throws(() => YESOD_REGISTRY.get("imaginaryRoot"), RangeError);
	const gevurahReceipt = manifestMalchusPrinter(["--session=../escape", "--key=aiSessionRoot"]);
	assert.notEqual(gevurahReceipt.status, 0);
	assert.match(gevurahReceipt.stderr, /Invalid AI session id/);
});
