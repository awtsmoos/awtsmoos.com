//B"H
//Blessed is He
//Boruch Hashem


/**
 * Series slice of the helper index.
 * Split sibling of index.js (verbatim relocation).
 */

var {
    makeNewSeries,
    editSeriesDetails,
    getSeries,
    getSubSeries,
    deleteSeriesFromHeichel,
    changeSubSeriesFromOneSeriesToAnother,
    editSubSeriesInSeries,
    getAllSeriesInHeichel,
    getSeriesByProperty
    // Removed old/deprecated series functions
} = require("./series.js");

module.exports = {
	makeNewSeries,
	editSeriesDetails,
	getSeries,
	getSubSeries,
	deleteSeriesFromHeichel,
	changeSubSeriesFromOneSeriesToAnother,
	editSubSeriesInSeries,
	getAllSeriesInHeichel,
	getSeriesByProperty
};
