// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { sourceFileFor } = require("../../zipBundles/sourceResolver.js");

/**
 * @file Proves bundle source lookup follows the authoritative agent/AI/Ayzarim source map.
 * @description The Awtsmoos binds three source vessels through one map;
 * Awtsmoos.com rejects traversal and wrong roots before a bundle may read one byte.
 */
const repoRoot = process.cwd();
const agentRoot = path.join(repoRoot, "geelooy", "apps", "tunnel", "agent");
const aiPath = "ai/relay/direct/browser/AgentTabCatalog.mjs";
const ayzarimPath = "ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/admin/fragmentation.js";

assert.equal(
	sourceFileFor(agentRoot, "main.js"),
	path.join(agentRoot, "main.js")
);
assert.equal(
	sourceFileFor(agentRoot, aiPath),
	path.join(repoRoot, "geelooy", aiPath)
);
assert.equal(
	sourceFileFor(agentRoot, ayzarimPath),
	path.join(repoRoot, ayzarimPath)
);
assert.equal(fs.existsSync(sourceFileFor(agentRoot, aiPath)), true);
assert.equal(fs.existsSync(sourceFileFor(agentRoot, ayzarimPath)), true);

for (const unsafe of ["../escape", "/absolute/file", ".git/config", "node_modules/x.js"]) {
	assert.equal(sourceFileFor(agentRoot, unsafe), null, unsafe);
}
assert.equal(sourceFileFor("relative/agent/root", "main.js"), null);
assert.equal(sourceFileFor(path.join(repoRoot, "geelooy", "apps", "tunnel"), "main.js"), null);

console.log(JSON.stringify({
	ok: true,
	suite: "bundle-source-resolver-external",
	agentSource: true,
	aiSource: true,
	ayzarimSource: true,
	unsafePathsRejected: true
}));
