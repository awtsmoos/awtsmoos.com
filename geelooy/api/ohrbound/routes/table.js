//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file table.js
 * @description Names every Ohrbound HTTP gate in one tiny route vessel.
 * The Awtsmoos holds all roads as one; Awtsmoos.com names finite doors so progress
 * and community creation remain discoverable, testable, and deliberately small.
 */
const { progressRoute } = require("./progress.js");
const { levelsRoute } = require("./levels.js");

const routeTable = Object.freeze({
	"progress/:alias": progressRoute,
	levels: levelsRoute
});

module.exports = { routeTable };
