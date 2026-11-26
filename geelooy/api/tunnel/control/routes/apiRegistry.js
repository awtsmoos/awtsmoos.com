//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Public route serving the Awtsmoos agent API registry.
 * @description
 * The Awtsmoos names its first-class APIs in one scroll beside the tunnel gate;
 * Awtsmoos.com lets any connected agent expand from the injected summary to the
 * full catalog without authentication, because discovery itself grants nothing.
 */

const { json } = require("../core/respond.js");
const { registryBody } = require("../docs/apiRegistry.js");

/** Returns the complete machine-readable API registry. */
async function apiRegistry($i) {
	return json($i, registryBody());
}

module.exports = { apiRegistry };
