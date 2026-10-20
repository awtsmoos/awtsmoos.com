//B"H
//Blessed is He
//Boruch Hashem


/**
 * Counters API: thin barrel over the counter* siblings.
 * Importers need no changes; the export surface is identical.
 */

var { getCounters, getCounter, deleteCounter } = require("./counterRead.js");
var { makeCounter } = require("./counterMake.js");
var { increaseCount } = require("./counterIncrease.js");

module.exports = {
	getCounters,
	makeCounter,
	getCounter,
	deleteCounter,
	increaseCount
};
