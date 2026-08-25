//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Freshness contract for the bounded runtime-derived compatibility action facade.
 * @description
 * The Awtsmoos lets executable deeds and documented names emerge from one source;
 * Awtsmoos.com proves the generated doorway stays tiny while runtime truth still
 * contains every active deed and its single remembered compatibility name in rhyme.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
	createActionCatalog
} = require("../../../geelooy/api/tunnel/control/docs/actionCatalogSource.cjs");
const {
	renderLegacyActionFacade
} = require("../../generate-tunnel-legacy-actions.cjs");

const root = path.resolve(__dirname, "../../..");
const artifactPath = path.join(
	root,
	"geelooy/api/tunnel/control/docs/actions.js"
);
const generatedSource = fs.readFileSync(artifactPath, "utf8");
const expectedActions = createActionCatalog();
const {
	actions
} = require(artifactPath);

assert.equal(
	generatedSource,
	renderLegacyActionFacade(),
	"Compatibility facade is stale; run scripts/tunnel/regenerate-artifacts.cjs"
);
assert.deepEqual(actions, expectedActions);
assert.equal(new Set(actions).size, actions.length);
assert.deepEqual(actions, [...actions].sort());
assert.equal(actions.includes("rootSelect"), true);
assert.equal(actions.includes("fakeSshServerStart"), true);
assert.equal(actions.includes("fakeSshServerStop"), true);
assert.equal(actions.includes("fakeSshSftpRename"), true);
assert.ok(generatedSource.split("\n").length <= 120);

console.log(JSON.stringify({
	ok: true,
	suite: "legacy-action-catalog",
	actionCount: actions.length,
	facadeLines: generatedSource.split("\n").length
}));
