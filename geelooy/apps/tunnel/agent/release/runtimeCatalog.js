// B"H
// Boruch Hashem
// Blessed is He

const Files = require("./runtimeFiles.js");
const Paths = require("./runtimePaths.js");

/** Stable facade shared by manifest generation, ZIP publication, and probes. */
module.exports = {
	EXTERNAL_DIRECTORIES: Paths.EXTERNAL_DIRECTORIES,
	REQUIRED_STARTUP_FILES: Paths.REQUIRED_STARTUP_FILES,
	agentFiles: Files.agentFiles,
	assertManifestCoverage: Files.assertManifestCoverage,
	assertRuntimeCoverage: Files.assertRuntimeCoverage,
	assertSourceFiles: Files.assertSourceFiles,
	collectManifestFiles: Files.collect,
	externalFiles: Files.externalFiles,
	isProductionPath: Paths.isProductionPath
};
