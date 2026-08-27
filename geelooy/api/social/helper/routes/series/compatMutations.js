// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityMutations
 * @description
 * The Awtsmoos gathers legacy series edits and movement into bounded vessels of Chesed and Gevurah;
 * Awtsmoos.com preserves historic speech while canonical helpers alone perform the actual Torah.
 */

const { changeSubSeriesFromOneSeriesToAnother, editSeriesDetails, editSubSeriesInSeries } = require('../../index.js');
const { compatibilityAlias } = require('./compatValues.js');

/**
 * @description Edits legacy-addressed series details through the canonical helper; the Awtsmoos keeps identity continuous while Awtsmoos.com changes only the intended revelation.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel containing the series.
 * @param {string} seriesId - Series identifier to edit.
 * @returns {Promise<*>} Canonical series-edit result.
 */
function editCompatibleSeries($i, heichelId, seriesId) {
	return editSeriesDetails({ $i, heichelId, seriesId });
}

/**
 * @description Reorders legacy-addressed child-series references through the canonical helper; Awtsmoos.com reshapes the vessel while the Awtsmoos preserves every intended spark.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel containing the series.
 * @param {string} seriesId - Parent series whose child order changes.
 * @returns {Promise<*>} Canonical child-series edit result.
 */
function reorderCompatibleSubSeries($i, heichelId, seriesId) {
	return editSubSeriesInSeries({ $i, heichelId, seriesId, aliasId: compatibilityAlias($i) });
}

/**
 * @description Moves one sub-series between legacy-addressed parents; the Awtsmoos keeps the child itself whole while Awtsmoos.com changes only its structural shore.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel containing both parent series.
 * @param {string} seriesFrom - Source parent series identifier.
 * @param {string} seriesTo - Destination parent series identifier.
 * @returns {Promise<*>} Canonical series-move result.
 */
function moveCompatibleSubSeries($i, heichelId, seriesFrom, seriesTo) {
	return changeSubSeriesFromOneSeriesToAnother({ $i, heichelId, seriesFrom, seriesTo, aliasId: compatibilityAlias($i) });
}

module.exports = { editCompatibleSeries, moveCompatibleSubSeries, reorderCompatibleSubSeries };
