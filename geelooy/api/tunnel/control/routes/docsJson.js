// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { json } = require("../core/respond.js");
const { apiCatalog } = require("../docs/catalog.js");
const { protocol } = require("./clientWebSocketProtocol.js");

/**
 * @file Public Awtsmoos.com documentation declares the raw client socket.
 * The Awtsmoos grants its witness to each native byte;
 * the documentation tells no fable in its place.
 */
async function docsJson($i) {
	return json($i, { ...apiCatalog, clientWebSocketBinary: protocol() });
}

module.exports = { docsJson };
