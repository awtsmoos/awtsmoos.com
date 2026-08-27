// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildAgentZip } = require("../../../../geelooy/api/tunnel/install/tools/zipBundle.js");
const { isProductionPath } = require("../../../../geelooy/apps/tunnel/agent/release/runtimePaths.js");
const { readZip } = require("./zipTestReader.cjs");

/**
 * @file Proves installer ZIP publication rejects a polluted manifest instead of silently filtering it.
 * @description The Awtsmoos makes source inventory and published archive one exact witness;
 * Awtsmoos.com therefore rejects forbidden manifest testimony before one unsafe or stale byte can hide inside a ZIP.
 */
const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "geelooy/apps/tunnel/agent/manifest.txt");
const original = fs.readFileSync(manifestPath);

assert.equal(isProductionPath(".DS_Store"), false);
assert.equal(isProductionPath("__MACOSX/file"), false);
assert.equal(isProductionPath("node_modules/x.js"), false);
assert.equal(isProductionPath(".git/config"), false);
assert.equal(isProductionPath("main.js"), true);

const canonicalZip = buildAgentZip(repoRoot);
assertZip(canonicalZip);

try {
	const polluted = `${original.toString("utf8").trimEnd()}\n.DS_Store\n__MACOSX/file\nnode_modules/x.js\n.git/config\nmissing-agent-file.js\n`;
	fs.writeFileSync(manifestPath, polluted, "utf8");
	assert.throws(
		() => buildAgentZip(repoRoot),
		error => /manifest_(?:forbidden|stale|dependency_omission|source_missing)_path?|manifest_forbidden_path|manifest_stale_path/.test(String(error?.message || error))
	);
} finally {
	fs.writeFileSync(manifestPath, original);
}

const restoredZip = buildAgentZip(repoRoot);
assertZip(restoredZip);
console.log(JSON.stringify({
	ok: true,
	suite: "agent-zip-defensive-strict-manifest",
	strictManifestValidation: true,
	canonicalZipRestored: true
}, null, 2));

function assertZip(zip) {
	assert.ok(Buffer.isBuffer(zip), "expected Buffer ZIP");
	assert.equal(zip.slice(0, 4).toString("hex"), "504b0304");
	const entries = readZip(zip);
	assert.ok(entries.has("main.js"), "entry file missing from ZIP");
	assert.equal(entries.has(".DS_Store"), false);
	assert.equal(entries.has("__MACOSX/file"), false);
	assert.equal(entries.has("node_modules/x.js"), false);
	assert.equal(entries.has(".git/config"), false);
}
