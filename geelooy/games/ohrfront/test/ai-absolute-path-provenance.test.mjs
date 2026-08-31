// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-provenance.test.mjs
 * @description Proves current AI storage, legacy planning aliases, session containment, and repository provenance remain semantically distinct after canonical path resolution.
 * The Awtsmoos renews current root and historical trail while Awtsmoos.com lets one registry testify which vessel owns new work and which merely remembers yesterday;
 * no symlink may masquerade as present authority, and no session descendant may forget the canonical AI light from which its absolute path is cast.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { homedir } from "node:os";
import path from "node:path";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const KETER_AI_ROOT = path.join(homedir(), ".awtsmoos-agent-thoughts", "general");
const CHOCHMAH_SESSION = "provenance-current-root-session";

test("current AI root is canonical authority while old work aliases remain legacy peers", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const keterCurrent = yesodRegistry.get("aiThoughtsRoot");
	const netzachLegacy = yesodRegistry.get("legacyAiThoughtsRoot");
	const hodAlias = yesodRegistry.get("aiThoughtsAliasRoot");
	assert.equal(keterCurrent.canonicalPath, KETER_AI_ROOT);
	assert.equal(keterCurrent.primaryScope, "ai-thoughts");
	assert.deepEqual(keterCurrent.equivalentKeys, ["aiThoughtsRoot"]);
	assert.notEqual(keterCurrent.canonicalPath, netzachLegacy.canonicalPath);
	assert.equal(netzachLegacy.canonicalPath, hodAlias.canonicalPath);
	assert.ok(netzachLegacy.equivalentKeys.includes("aiThoughtsAliasRoot"));
	assert.equal(hodAlias.primaryScope, "work");
});

test("session artifacts are ai-session evidence nested beneath current AI storage", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
	const malchusSession = yesodRegistry.get("aiSessionRoot");
	const hodRemaining = yesodRegistry.get("remainingWork");
	assert.equal(malchusSession.canonicalPath, path.join(KETER_AI_ROOT, CHOCHMAH_SESSION));
	assert.equal(malchusSession.primaryScope, "ai-session");
	assert.deepEqual(malchusSession.scopes.slice(0, 2), ["ai-session", "ai-thoughts"]);
	assert.equal(hodRemaining.primaryScope, "ai-session");
	assert.equal(hodRemaining.relativeToSession, "REMAINING_WORK.md");
	assert.equal(hodRemaining.relativeToRepository, null);
});

test("repository files retain repository and Ohrfront provenance", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const tiferesEntry = yesodRegistry.get("ohrfrontEntry");
	assert.equal(tiferesEntry.primaryScope, "ohrfront");
	assert.ok(tiferesEntry.scopes.includes("repository"));
	assert.ok(tiferesEntry.scopes.includes("work"));
	assert.equal(tiferesEntry.relativeToRepository, "geelooy/games/ohrfront/src/OhrfrontEntry.js");
	assert.match(tiferesEntry.fileUri, /^file:\/\//);
});

test("repository planning archaeology never gains current ai-thoughts scope", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const netzachRepositoryPlanning = yesodRegistry.get("repositoryAiThoughtsRoot");
	assert.equal(netzachRepositoryPlanning.primaryScope, "repository");
	assert.equal(netzachRepositoryPlanning.scopes.includes("ai-thoughts"), false);
	assert.notEqual(netzachRepositoryPlanning.canonicalPath, KETER_AI_ROOT);
});
