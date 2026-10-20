//B"H
//Blessed is He
//Boruch Hashem
/**
 * Barrel for the alias modules; re-exports the original alias.js surface.
 */
var { verifyAlias, verifyAliasOwnership } = require("./aliasVerify.js");
var { getAlias } = require("./aliasGet.js");
var { updateAlias } = require("./aliasUpdate.js");
var { getAliasesDetails } = require("./aliasDetails.js");
var { getAliasIDs, generateAliasId } = require("./aliasIds.js");
var { createNewAlias } = require("./aliasCreate.js");
var { deleteAlias } = require("./aliasDelete.js");
var { getDetailedAlias } = require("./aliasDetail.js");
var { setDefaultAlias, getDefaultAlias } = require("./aliasDefault.js");
module.exports = {
	verifyAlias,
	getAlias,
	updateAlias,
	getAliasesDetails,
	getAliasIDs,
	createNewAlias,
	verifyAliasOwnership,
	deleteAlias,
	generateAliasId,
	getDetailedAlias,
	setDefaultAlias,
	getDefaultAlias
};
