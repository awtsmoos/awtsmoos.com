// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preserveAliasIdentity } = require("../tools/fs/actionGroups/commandActions.js");

/**
 * @file Proves caller-facing commandJobCancel identity remains distinct from its canonical worker.
 * @description The Awtsmoos preserves the doorway the caller named;
 * Awtsmoos.com separately reveals commandCancel as the worker that served it.
 */
const response = preserveAliasIdentity(
	{ ok: true, action: "commandCancel", actualAction: "commandCancel" },
	"commandJobCancel",
	"commandCancel"
);
assert.equal(response.action, "commandJobCancel");
assert.equal(response.requestAction, "commandJobCancel");
assert.equal(response.actualAction, "commandCancel");
assert.equal(response.canonicalAction, "commandCancel");
assert.equal(response.servedByAction, "commandCancel");

const source = fs.readFileSync(
	path.join(__dirname, "..", "tools", "fs", "actionGroups", "commandActions.js"),
	"utf8"
);
assert.match(
	source,
	/commandJobCancel:\s*\(\)\s*=>\s*runAlias\(config, payload, "commandJobCancel", "commandCancel"/
);

console.log(JSON.stringify({
	ok: true,
	suite: "command-job-cancel-alias-identity",
	callerIdentityPreserved: true,
	canonicalWorkerPreserved: true
}));
