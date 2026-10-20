//B"H
//Blessed is He
//Boruch Hashem


/**
 * Shared counter state: the gadgets counter path and general helpers.
 * Split sibling of counter.js (verbatim relocation).
 */

var {
    loggedIn,
    er
} = require("./general.js");

var counterPath = `/gadgets`

module.exports = {
	counterPath,
	loggedIn,
	er
};
