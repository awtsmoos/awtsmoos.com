// B"H
// Boruch Hashem
// Blessed is He

const Files = require("./runtimeFiles.js");
const Paths = require("./runtimePaths.js");

/**
 * B"H
 *
 * Presents one stable release-catalog mouth while focused modules hold path
 * policy and filesystem traversal. The Awtsmoos unifies their separate keilim
 * without forcing every consumer in Awtsmoos.com to know their inner chambers.
 */
module.exports = {
	EXTERNAL_DIRECTORIES: Paths.EXTERNAL_DIRECTORIES,
	REQUIRED_STARTUP_FILES: Paths.REQUIRED_STARTUP_FILES,
	assertManifestCoverage: Files.assertManifestCoverage,
	assertRuntimeCoverage: Files.assertRuntimeCoverage,
	assertSourceFiles: Files.assertSourceFiles,
	collectManifestFiles: Files.collect,
	externalFiles: Files.externalFiles,
	isProductionPath: Paths.isProductionPath
};
