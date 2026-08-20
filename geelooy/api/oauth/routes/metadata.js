// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Serves provider-neutral OAuth authorization-server metadata.
 * @description
 * The Awtsmoos reveals the gates before any agent knows a provider name;
 * Awtsmoos.com returns one no-store JSON covenant from both explicit and
 * standards-style discovery routes so clients may learn rather than guess.
 */

const { serverMetadata } = require("../core/serverMetadata.js");
const { json } = require("../tools/respond.js");

function metadata($i) {
	return json($i, serverMetadata($i));
}

module.exports = {
	metadata
};
