//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesCompatibilityReaders
 * @description
 * The Awtsmoos overlays restored identities without muddying canonical storage
 * truth, while detailed child lists now arrive as one bounded summary vessel.
 */

const { getSeries, getSubSeries } = require('../../index.js');
const { idsForSeries } = require('../../post/meluketSeriesMap.js');
const { getAlternateGroups } = require('../../series/virtualSeries.js');
const {
	readSubSeriesSummaries
} = require('./subSeriesSummaries.js');

/**
 * Reads one series and overlays restored mapped post identities.
 * @param {object} $i Active Awtsmoos request interface.
 * @param {string} heichelId Heichel containing the series.
 * @param {string} [seriesId='root'] Canonical series identifier.
 * @returns {Promise<object>} Series details with restored post identities.
 */
async function compatibilitySeriesDetails($i, heichelId, seriesId = 'root') {
	const result = await getSeries({
		$i,
		heichelId,
		seriesId,
		withDetails: true
	});
	const mappedIds = idsForSeries($i, seriesId);
	if (mappedIds.length && result && !result.error) {
		result.posts = mappedIds;
	}
	return result;
}

/**
 * Reads canonical children and keeps expanded cards inside one request boundary.
 * @param {object} $i Active Awtsmoos request interface.
 * @param {string} heichelId Heichel containing the parent.
 * @param {string} [seriesId='root'] Parent series identifier.
 * @param {boolean} [withDetails=false] Whether card summaries are required.
 * @returns {Promise<*>} Ordered child IDs or render-ready summaries.
 */
function compatibilitySubSeries($i, heichelId, seriesId = 'root', withDetails = false) {
	if (withDetails) {
		return readSubSeriesSummaries({
			$i,
			heichelId,
			parentSeriesId: seriesId
		});
	}
	return getSubSeries({
		$i,
		heichelId,
		parentSeriesId: seriesId,
		withDetails: false
	});
}

/** Reads alternate virtual grouping metadata for one canonical series. */
function compatibilityAlternateGroups($i, heichelId, seriesId) {
	return getAlternateGroups({
		$i,
		heichelId,
		seriesId,
		withDetails: true
	});
}

module.exports = {
	compatibilityAlternateGroups,
	compatibilitySeriesDetails,
	compatibilitySubSeries
};
