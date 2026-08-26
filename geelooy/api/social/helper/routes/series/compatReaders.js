// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityReaders
 * @description
 * The Awtsmoos lets restored identities overlay ordinary series reads without contaminating base storage truth;
 * Awtsmoos.com keeps Meluket mappings and virtual groups in a compatibility vessel, clear for future youth.
 */

const {
	getSeries,
	getSubSeries
} = require('../../index.js');
const {
	idsForSeries
} = require('../../post/meluketSeriesMap.js');
const {
	getAlternateGroups
} = require('../../series/virtualSeries.js');

/** Reads one series and overlays any restored mapped post identities. */
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

/** Reads sub-series through the canonical domain helper. */
function compatibilitySubSeries(
	$i,
	heichelId,
	seriesId = 'root',
	withDetails = false
) {
	return getSubSeries({
		$i,
		heichelId,
		parentSeriesId: seriesId,
		withDetails
	});
}

/** Reads alternate virtual grouping metadata for a canonical series. */
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
