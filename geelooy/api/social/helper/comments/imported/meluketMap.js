//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module MeluketMap
 * @description Barrel for the meluket map: re-exports the identical surface from the split sibling modules.
 */

	const { resolve, entries, mapFile } = require("./meluketMapLoad.js");

module.exports = { resolve, entries, mapFile };
