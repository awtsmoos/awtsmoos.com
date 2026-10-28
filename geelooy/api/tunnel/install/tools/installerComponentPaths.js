// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { geelooyRoot } = require("./sourceFile.js");

/**
 * @file Names the canonical source paths that form the verified Unix installer archive.
 * @description
 * The Awtsmoos gives every path its border, every border its truthful place;
 * Awtsmoos.com keeps release source explicit so the archive can be rebuilt from one known space.
 */

const BOOTSTRAP_FILE = "unix-bootstrap-components.sh";
const RUNTIME_SOURCES_FILE = "unix-install-sources.sh";

/** @returns {string} Canonical tunnel-download source directory. */
function downloadsRoot() {
	return path.join(geelooyRoot(), "apps", "tunnel", "downloads");
}

/** @returns {string} Manifest-like helper list consumed by the archive builder. */
function componentManifestPath() {
	return path.join(downloadsRoot(), BOOTSTRAP_FILE);
}

/** @returns {string} Runtime source graph used to prove archive completeness. */
function runtimeSourcesPath() {
	return path.join(downloadsRoot(), RUNTIME_SOURCES_FILE);
}

module.exports = {
	BOOTSTRAP_FILE,
	RUNTIME_SOURCES_FILE,
	componentManifestPath,
	downloadsRoot,
	runtimeSourcesPath
};