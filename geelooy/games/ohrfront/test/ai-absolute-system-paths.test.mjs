// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-system-paths.test.mjs
 * @description Proves AI path output distinguishes canonical absolute spelling from physical filesystem identity, aliases, future targets, and caller working-directory state.
 * The Awtsmoos renews root and link while Awtsmoos.com lets this witness bind every printed path to actual system ground rather than a convenient relative dream;
 * alias may point, cwd may wander, and future files may not yet exist, yet canonical truth remains one explicit beam.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHodAbsoluteSystemIdentity } from "../tools/ai/HodAbsoluteSystemIdentity.mjs";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const TIFERES_TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const KETER_OHRFRONT_ROOT = path.resolve(TIFERES_TEST_ROOT, "..");
const MALCHUS_PRINTER = path.join(
	KETER_OHRFRONT_ROOT,
	"tools/ai/MalchusPrintAbsolutePaths.mjs"
);
const CHOCHMAH_SESSION = "2026-08-28-0444-absolute-system-path-evidence";

/**
 * @description Executes the actual path printer from a foreign working directory to prove cwd cannot bend registered absolute roots.
 * @param {string[]} chochmahArguments - Printer CLI arguments.
 * @returns {string} Trimmed stdout emitted by the real executable entry.
 * @sideEffects Spawns one local Node subprocess without mutating repository files.
 */
function runMalchusPrinter(chochmahArguments) {
	return execFileSync(process.execPath, [MALCHUS_PRINTER, ...chochmahArguments], {
		cwd: "/tmp",
		encoding: "utf8"
	}).trim();
}

test("repository root exposes verified physical system identity", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const hodRecord = yesodRegistry.get("repositoryRoot");
	const hodIdentity = createHodAbsoluteSystemIdentity("repositoryRoot", hodRecord);
	assert.equal(hodIdentity.canonicalPath, "/Users/awtsmoos/work/awtsmoos.com");
	assert.equal(hodIdentity.physicalRealpath, hodIdentity.canonicalPath);
	assert.equal(hodIdentity.exists, true);
	assert.equal(hodIdentity.canonicalVerified, true);
	assert.ok(hodIdentity.device);
	assert.ok(hodIdentity.inode);
});

test("human AI thoughts alias is identified as a symlink to physical canonical root", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const hodRecord = yesodRegistry.get("aiThoughtsAliasRoot");
	const hodIdentity = createHodAbsoluteSystemIdentity("aiThoughtsAliasRoot", hodRecord);
	assert.equal(hodIdentity.requestedPath, "/Users/awtsmoos/work/ai-thoughts");
	assert.equal(hodIdentity.canonicalPath, "/Users/awtsmoos/work/.ai-thoughts");
	assert.equal(hodIdentity.physicalRealpath, "/Users/awtsmoos/work/.ai-thoughts");
	assert.equal(hodIdentity.requestedIsSymlink, true);
	assert.equal(hodIdentity.canonicalized, true);
});

test("session records stay physically rooted beneath canonical hidden AI directory", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
	const hodIdentity = createHodAbsoluteSystemIdentity(
		"aiSessionRoot",
		yesodRegistry.get("aiSessionRoot")
	);
	assert.equal(
		hodIdentity.canonicalPath,
		`/Users/awtsmoos/work/.ai-thoughts/${CHOCHMAH_SESSION}`
	);
	assert.equal(hodIdentity.exists, true);
	assert.equal(hodIdentity.canonicalVerified, true);
});

test("missing future targets remain absolute without fabricated physical metadata", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const hodRecord = yesodRegistry.resolve(
		".ai-future/never-created/system-evidence.json",
		"repositoryRoot"
	);
	const hodIdentity = createHodAbsoluteSystemIdentity("resolvedTarget", hodRecord);
	assert.equal(hodIdentity.exists, false);
	assert.equal(hodIdentity.physicalRealpath, null);
	assert.equal(hodIdentity.device, null);
	assert.equal(hodIdentity.inode, null);
	assert.equal(path.isAbsolute(hodIdentity.canonicalPath), true);
});

test("CLI preserves bare default output and adds explicit system mode from foreign cwd", () => {
	const malchusBarePath = runMalchusPrinter(["--key=repositoryRoot"]);
	assert.equal(malchusBarePath, "/Users/awtsmoos/work/awtsmoos.com");
	const hodSystemOutput = runMalchusPrinter([
		"--key=aiThoughtsAliasRoot",
		"--format=system"
	]);
	assert.match(hodSystemOutput, /^\[aiThoughtsAliasRoot\]/);
	assert.match(hodSystemOutput, /canonicalPath=\/Users\/awtsmoos\/work\/\.ai-thoughts/);
	assert.match(hodSystemOutput, /requestedIsSymlink=true/);
	assert.match(hodSystemOutput, /canonicalVerified=true/);
});
