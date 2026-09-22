// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public machine-readable catalog of Awtsmoos application APIs.
 * @description
 * Discovery is public so an outsider can learn the whole application surface
 * before authenticating; calling is scope-gated. Served at
 * GET /api/tunnel/control/app-api/catalog.
 */

const { json } = require("../core/respond.js");
const { catalogBody } = require("../docs/appApiCatalog.js");

async function appApiCatalogRoute($i) {
	return json($i, catalogBody());
}

module.exports = { appApiCatalogRoute };
