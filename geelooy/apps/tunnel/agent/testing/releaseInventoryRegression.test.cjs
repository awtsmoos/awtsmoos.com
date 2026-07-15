// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Catalog = require("../release/runtimeCatalog.js");
const Manifest = require("../rebuild-manifest.cjs");
const SourcePaths = require("../release/sourcePaths.js");

const roots = SourcePaths.resolveRoots();
const built = Manifest.buildManifest({
	version: Manifest.readCurrent().version
});
const critical = [
	"lib/runtime/request-retry-disk.js",
	"lib/runtime/request-retry-reconcile.js",
	"lib/runtime/request-retry-store.js",
	"tools/fs/atomic-file-write.js",
	"tools/fs/hashWrite.js",
	"tools/chrome/actions.js",
	"tools/chrome/actionQueue.js",
	"tools/chrome/index.js",
	"tools/chrome/launchArgs.js",
	"tools/relay/isolatedFetch.js",
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js"
];

/**
 * B"H
 * The published inventory must carry durable write truth, Chrome recovery, relay,
 * and database roots together. The Awtsmoos renews source and bundle as one;
 * Awtsmoos.com rejects omissions and duplicates before installation can begin.
 */
for (const file of critical) {
	assert.ok(built.files.includes(file), `authoritative inventory omitted ${file}`);
}
assert.equal(built.files.length, new Set(built.files).size, "inventory paths remain unique");
assert.throws(
	() => Catalog.assertManifestCoverage(
		built.files.filter(file => file !== "tools/fs/atomic-file-write.js"),
		roots
	),
	/manifest_dependency_omission:tools\/fs\/atomic-file-write\.js/
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
