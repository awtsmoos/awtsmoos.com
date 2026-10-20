//B"H
//Blessed is He
//Boruch Hashem


/**
 * Alias slice of the helper index.
 * Split sibling of index.js (verbatim relocation).
 */

var {
    getAliasesDetails, getAliasIDs, createNewAlias, verifyAliasOwnership,
    verifyAlias, getDetailedAlias, getDetailedAliasesByArray, deleteAlias,
    updateAlias, getAlias
} = require("./alias.js");

module.exports = {
	getAliasesDetails,
	getAliasIDs,
	createNewAlias,
	verifyAliasOwnership,
	verifyAlias,
	getDetailedAlias,
	getDetailedAliasesByArray,
	deleteAlias,
	updateAlias,
	getAlias
};
