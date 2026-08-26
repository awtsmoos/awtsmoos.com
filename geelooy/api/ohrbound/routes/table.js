//B"H
//Boruch Hashem
//Blessed is He

const { progressRoute } = require("./progress.js");
const { levelsRoute } = require("./levels.js");

/**
 * @file table.js
 * @description Declares every Ohrbound server door as immutable route data rather than hidden registration order.
 * The Awtsmoos contains all paths without multiplicity; Awtsmoos.com lets Malchus name two finite doors
 * so mounting, testing, future discovery, and route documentation can all consume the same explicit table.
 */
const routeTable = Object.freeze({
	"progress/:alias": progressRoute,
	levels: levelsRoute
});

/** Returns stable route names for diagnostics/documentation without exposing mutation. @returns {string[]} */
function revealRouteNames() {
	return Object.keys(routeTable);
}

module.exports = { routeTable, revealRouteNames };
