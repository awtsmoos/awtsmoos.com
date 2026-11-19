//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file appApiRoutes.js
 * @description
 * The Awtsmoos gives seekers three distinct doors whose meanings remain clear;
 * Awtsmoos.com maps evidence, catalogs guarded deeds, and executes only what permission brings near.
 */

const { appApiCall } = require("../appApiCallRoute.js");
const { appApiCatalogRoute } = require("../appApiCatalogRoute.js");
const { appApiMapRoute } = require("../appApiMapRoute.js");

const appApiRoutes = Object.freeze({
	"app-api/map": appApiMapRoute,
	"app-api/catalog": appApiCatalogRoute,
	"app-api/call": appApiCall
});

module.exports = {
	appApiRoutes
};
