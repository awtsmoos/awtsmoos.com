// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-provenance.test.mjs
 * @description Proves canonical AI paths now carry semantic role, containing scope, portable URI, alias equivalence, session-relative identity, and legacy-facade parity.
 * The Awtsmoos renews root and relation while Awtsmoos.com witnesses that an absolute path may reveal not only where it stands, but which finite vessel owns its light;
 * old callers keep their names, new agents receive richer truth, and alias spelling never competes with canonical physical ground in sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
	OHRFRONT_ABSOLUTE_ROOTS
} from "../scripts/ai/ChochmahAbsolutePathAuthority.mjs";
import { renderHodAbsolutePaths } from "../tools/ai/HodAbsolutePathRenderer.mjs";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const CHOCHMAH_SESSION = "2026-08-28-0312-absolute-path-truth";

/**
 * @description Asserts the common enriched provenance covenant shared by canonical declared and synthetic path records.
 * @param {object} hodRecord - Enriched canonical path record under test.
 * @returns {void}
 * @sideEffects Throws assertion errors only when provenance is incomplete.
 */
function assertHodProvenance(hodRecord) {
	assert.equal(path.isAbsolute(hodRecord.canonicalPath), true);
	assert.equal(hodRecord.path, hodRecord.canonicalPath);
	assert.equal(typeof hodRecord.key, "string");
	assert.equal(typeof hodRecord.role, "string");
	assert.equal(Array.isArray(hodRecord.scopes), true);
	assert.equal(typeof hodRecord.primaryScope, "string");
	assert.equal(hodRecord.fileUri.startsWith("file://"), true);
}

test("repository and game records expose semantic containment provenance", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const hodEntry = yesodRegistry.get("ohrfrontEntry");
	assertHodProvenance(hodEntry);
	assert.equal(hodEntry.role, "entry");
	assert.equal(hodEntry.primaryScope, "ohrfront");
	assert.ok(hodEntry.scopes.includes("repository"));
	assert.equal(hodEntry.relativeToRepository, "geelooy/games/ohrfront/src/OhrfrontEntry.js");
	assert.equal(hodEntry.relativeToSession, null);
});

test("physical AI root and human alias explicitly reveal canonical equivalence", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const hodPhysical = yesodRegistry.get("aiThoughtsRoot");
	const hodAlias = yesodRegistry.get("aiThoughtsAliasRoot");
	assert.equal(hodPhysical.canonicalPath, hodAlias.canonicalPath);
	assert.equal(hodAlias.requestedPath.endsWith("/ai-thoughts"), true);
	assert.ok(hodPhysical.equivalentKeys.includes("aiThoughtsAliasRoot"));
	assert.ok(hodAlias.equivalentKeys.includes("aiThoughtsRoot"));
	assert.equal(hodPhysical.primaryScope, "work");
});

test("session artifacts reveal planning role and session-relative identity", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
	const hodRemaining = yesodRegistry.get("remainingWork");
	assertHodProvenance(hodRemaining);
	assert.equal(hodRemaining.role, "planning");
	assert.equal(hodRemaining.primaryScope, "ai-session");
	assert.equal(hodRemaining.relativeToSession, "REMAINING_WORK.md");
	assert.ok(hodRemaining.scopes.includes("work"));
});

test("specialized roots choose their narrowest ownership scope", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	assert.equal(yesodRegistry.get("dynamicServerRoot").primaryScope, "dynamic-server");
	assert.equal(yesodRegistry.get("proceduralCoreRoot").primaryScope, "procedural-core");
});

test("synthetic resolution receives the same provenance shape", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	const hodResolved = yesodRegistry.resolve("src/OhrfrontEntry.js", "ohrfrontRoot");
	assertHodProvenance(hodResolved);
	assert.equal(hodResolved.key, "resolvedTarget");
	assert.equal(hodResolved.primaryScope, "ohrfront");
	assert.equal(hodResolved.relativeToRepository, "geelooy/games/ohrfront/src/OhrfrontEntry.js");
});

test("historical scripts/ai roots project the canonical registry rather than a second truth", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	assert.equal(OHRFRONT_ABSOLUTE_ROOTS.repository, yesodRegistry.get("repositoryRoot").canonicalPath);
	assert.equal(OHRFRONT_ABSOLUTE_ROOTS.game, yesodRegistry.get("ohrfrontRoot").canonicalPath);
	assert.equal(OHRFRONT_ABSOLUTE_ROOTS.tests, yesodRegistry.get("ohrfrontTestRoot").canonicalPath);
	assert.equal(OHRFRONT_ABSOLUTE_ROOTS.aiThoughts, yesodRegistry.get("aiThoughtsRoot").canonicalPath);
});

test("JSON keeps the v2 envelope while enriching each historical path record", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(CHOCHMAH_SESSION);
	const hodJson = JSON.parse(renderHodAbsolutePaths(yesodRegistry.view(), "json", {
		sessionId: CHOCHMAH_SESSION
	}));
	assert.equal(hodJson.schema, "awtsmoos.ai.absolute-system-paths.v2");
	assert.equal(hodJson.cwdIndependent, true);
	assert.equal(hodJson.paths.ohrfrontEntry.role, "entry");
	assert.equal(hodJson.paths.remainingWork.primaryScope, "ai-session");
	assert.equal(hodJson.paths.aiThoughtsAliasRoot.fileUri.startsWith("file://"), true);
});
