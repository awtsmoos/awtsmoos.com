//B"H
//Blessed is He
//Boruch Hashem
/**
 * B"H
 *
 * Helper functions to manage SERIES.
 * Series contain details (prateem), an array of subSeries IDs,
 * and an object containing their posts.
 */
const { makeNewSeries } = require("./seriesCreate.js");
const { editSeriesDetails } = require("./seriesEdit.js");
const { getSeries } = require("./seriesRead.js");
const { getSubSeries, getSeriesByProperty } = require("./seriesSubRead.js");
const { deleteSeriesFromHeichel } = require("./seriesDeleteExec.js");
const { changeSubSeriesFromOneSeriesToAnother } = require("./seriesMove.js");
const { editSubSeriesInSeries } = require("./seriesEditSub.js");
const { getAllSeriesInHeichel } = require("./seriesList.js");

// --- Deprecated / Removed Functions ---
// - addContentToSeries: Replaced by addPostToSeries (for posts) and addSubSeriesToParent (internal for series)
// - deleteContentFromSeries: Replaced by deletePostFromSeries and handling within deleteSeriesFromHeichel
// - editPostsInSeries: Ordering via object keys is not reliable/intended. Removed for simplicity.
// - traverseSeries: Complex. If needed, should be rewritten carefully based on new structure. Replace with targeted gets where possible.
// - checkParentIDsAndAdd: Likely related to traversal/old structure. Needs reassessment if specific functionality is required. Replace with targeted updates.

// --- Export the module ---
module.exports = {
    makeNewSeries,
    editSeriesDetails,
    getSeries,
    getSubSeries,
    deleteSeriesFromHeichel,
    changeSubSeriesFromOneSeriesToAnother,
    editSubSeriesInSeries,
    getAllSeriesInHeichel,
    getSeriesByProperty,
    // Removed old functions...

    // --- Removed ---
	// addContentToSeries,
    // deleteContentFromSeries,
	// editPostsInSeries,
	// traverseSeries, // Consider replacing with targeted gets or simpler traversal if needed
	// checkParentIDsAndAdd, // Consider replacing with targeted updates

    // --- Post functions are now in post/index.js ---
};
