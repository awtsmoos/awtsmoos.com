// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-release.test.mjs
 * @description Proves release-facing path evidence names the host-level canonical AI root first, preserves legacy archaeology explicitly, and documents this machine's verified absolute Node executable.
 * The Awtsmoos renews release, root, executable, and witness while Awtsmoos.com lets publication begin from measured filesystem truth rather than remembered aliases;
 * current storage stands first, legacy trails remain visible, and every release command carries a physical absolute vessel through the night.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const KETER_AI_ROOT = path.join(homedir(), ".awtsmoos-agent-thoughts", "general");
const MALCHUS_RELEASE_DOC = fileURLToPath(new URL("../tools/ai/RELEASE_PATHS.md", import.meta.url));
const MALCHUS_README = fileURLToPath(new URL("../tools/ai/README.md", import.meta.url));

test("release session paths resolve beneath canonical host-level AI storage", () => {
	const chochmahSession = "release-path-test-session";
	const yesodRegistry = new YesodAbsolutePathRegistry(chochmahSession);
	assert.equal(yesodRegistry.get("aiThoughtsRoot").canonicalPath, KETER_AI_ROOT);
	assert.equal(
		yesodRegistry.get("aiSessionRoot").canonicalPath,
		path.join(KETER_AI_ROOT, chochmahSession)
	);
	assert.equal(
		yesodRegistry.get("remainingWork").canonicalPath,
		path.join(KETER_AI_ROOT, chochmahSession, "REMAINING_WORK.md")
	);
});

test("legacy planning roots remain printable but physically distinct from current authority", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const keterCurrent = yesodRegistry.get("aiThoughtsRoot");
	const netzachLegacy = yesodRegistry.get("legacyAiThoughtsRoot");
	const hodRepository = yesodRegistry.get("repositoryAiThoughtsRoot");
	assert.notEqual(keterCurrent.canonicalPath, netzachLegacy.canonicalPath);
	assert.notEqual(keterCurrent.canonicalPath, hodRepository.canonicalPath);
	assert.equal(keterCurrent.primaryScope, "ai-thoughts");
	assert.equal(netzachLegacy.primaryScope, "work");
});

test("release docs print canonical AI storage and verified Node executable", () => {
	const hodRelease = readFileSync(MALCHUS_RELEASE_DOC, "utf8");
	const hodReadme = readFileSync(MALCHUS_README, "utf8");
	for (const hodDocument of [hodRelease, hodReadme]) {
		assert.ok(hodDocument.includes(KETER_AI_ROOT));
		assert.ok(hodDocument.includes(process.execPath));
		assert.ok(hodDocument.includes("Awtsmoos.com"));
	}
});

test("release-facing roots and tools remain absolute regardless of caller cwd", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry("release-absolute-test");
	for (const chochmahKey of [
		"repositoryRoot",
		"ohrfrontRoot",
		"aiThoughtsRoot",
		"aiSessionRoot",
		"remainingWork",
		"absolutePathPrinter",
		"absolutePathEvidenceWriterCli"
	]) {
		assert.equal(path.isAbsolute(yesodRegistry.get(chochmahKey).canonicalPath), true);
	}
});
