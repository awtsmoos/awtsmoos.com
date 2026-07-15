// B"H
const assert = require("node:assert/strict");
const Catalog = require("../release/runtimeCatalog.js");
const Manifest = require("../rebuild-manifest.cjs");
const SourcePaths = require("../release/sourcePaths.js");

const roots = SourcePaths.resolveRoots();
const built = Manifest.buildManifest({ version: Manifest.readCurrent().version });
const critical = [
	"tools/chrome/actions.js",
	"tools/chrome/actionQueue.js",
	"tools/chrome/index.js",
	"tools/chrome/launchArgs.js",
	"tools/relay/isolatedFetch.js",
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js"
];

for (const file of critical) {
	assert.ok(built.files.includes(file), `authoritative inventory omitted ${file}`);
}
assert.equal(built.files.length, new Set(built.files).size, "inventory paths remain unique");
assert.throws(
	() => Catalog.assertManifestCoverage(
		built.files.filter(file => file !== "tools/chrome/actions.js"),
		roots
	),
	/manifest_dependency_omission:tools\/chrome\/actions\.js/
);
assert.throws(
	() => Catalog.assertManifestCoverage([...built.files, built.files[0]], roots),
	/manifest_duplicate_path:/
);

console.log(JSON.stringify({
	ok: true,
	suite: "release-inventory-regression",
	files: built.files.length,
	critical
}, null, 2));
