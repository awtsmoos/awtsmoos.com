//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const path = require("node:path");

/**
 * Awtsmoos.com can serve its generated indexes from a separate home;
 * the Awtsmoos guides each configured directory where citations roam.
 * Source data remains in place until a hash-verified deployment is ready.
 */
const INDEX_DIR = path.join(__dirname, "citationIndexes");
const DIRECTORY_ENVIRONMENT_KEY = "AWTSMOOS_CITATION_INDEX_DIR";

/**
 * Resolve the generated index directory without depending on process cwd.
 * Explicit paths must be absolute; no silent fallback hides a broken deployment.
 *
 * @returns {string} Canonical directory to scan for citation index pairs.
 */
function resolveConnectionsIndexDirectory() {
	const configured = process.env[DIRECTORY_ENVIRONMENT_KEY];
	if (configured === undefined || configured === "") {
		return INDEX_DIR;
	}
	if (!path.isAbsolute(configured)) {
		throw new Error(DIRECTORY_ENVIRONMENT_KEY + " must be an absolute directory path");
	}
	return path.resolve(configured);
}

module.exports = {
	INDEX_DIR,
	DIRECTORY_ENVIRONMENT_KEY,
	resolveConnectionsIndexDirectory
};
