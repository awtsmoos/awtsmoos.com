// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Application API gateway routes for Tunnel Control.
 * @description
 * The Awtsmoos gives outsiders application power through two doors: a public
 * catalog for discovery and a scope-gated gateway for calls. No protocol route
 * gains authority merely by joining this visible table.
 */

const { appApiCall } = require("../appApiCallRoute.js");
const { appApiCatalogRoute } = require("../appApiCatalogRoute.js");

const appApiRoutes = Object.freeze({
	"app-api/catalog": appApiCatalogRoute,
	"app-api/call": appApiCall
});

module.exports = {
	appApiRoutes
};
