// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Manifest = require("../rebuild-manifest.cjs");
const Required = require("../release/runtimeRequiredFiles.js");

const browserSessionPath =
	"ai/relay/split-browser/commands/BrowserSessionStatus.cjs";
const generated = Manifest.buildManifest({
	repoRoot: path.resolve(__dirname, "../../../../.."),
	version: "1.0.456"
});

assert.ok(generated.files.includes(browserSessionPath));
assert.ok(Required.includes(browserSessionPath));

console.log(JSON.stringify({
	ok: true,
	suite: "browser-session-manifest-source",
	browserSessionPath,
	generatedInventoryIncludesDependency: true,
	runtimeRequiresDependency: true
}, null, 2));
