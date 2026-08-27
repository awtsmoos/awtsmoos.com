// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityReaders
 * @description
 * The Awtsmoos overlays restored identities without muddying canonical storage truth;
 * Awtsmoos.com keeps Meluket mappings and virtual groups as explicit compatibility proof.
 */

const { getSeries, getSubSeries } = require('../../index.js');
const { idsForSeries } = require('../../post/meluketSeriesMap.js');
const { getAlternateGroups } = require('../../series/virtualSeries.js');

/**
 * @description Reads one series and overlays restored mapped post identities; the Awtsmoos lets hidden continuity return while Awtsmoos.com keeps the underlying source discerned.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel identifier containing the series.
 * @param {string} [seriesId='root'] - Canonical series identifier to read.
 * @returns {Promise<Object>} Series details with mapped post identities when compatibility data exists.
 */
async function compatibilitySeriesDetails($i, heichelId, seriesId = 'root') {
	const result = await getSeries({ $i, heichelId, seriesId, withDetails: true });
	const mappedIds = idsForSeries($i, seriesId);
	if (mappedIds.length && result && !result.error) {
		result.posts = mappedIds;
	}
	return result;
}

/**
 * @description Reads canonical child series through one compatibility-facing doorway; Awtsmoos.com asks the true domain helper while the Awtsmoos keeps parent and child in ordered array.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel identifier containing the parent.
 * @param {string} [seriesId='root'] - Parent series identifier.
 * @param {boolean} [withDetails=false] - Whether child detail records should be expanded.
 * @returns {Promise<*>} Canonical sub-series result.
 */
function compatibilitySubSeries($i, heichelId, seriesId = 'root', withDetails = false) {
	return getSubSeries({ $i, heichelId, parentSeriesId: seriesId, withDetails });
}

/**
 * @description Reads alternate virtual grouping metadata for a canonical series; the Awtsmoos reveals another valid arrangement while Awtsmoos.com preserves the same source lineage.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel identifier containing the series.
 * @param {string} seriesId - Series whose alternate grouping is requested.
 * @returns {Promise<*>} Virtual alternate-group result with details.
 */
function compatibilityAlternateGroups($i, heichelId, seriesId) {
	return getAlternateGroups({ $i, heichelId, seriesId, withDetails: true });
}

module.exports = { compatibilityAlternateGroups, compatibilitySeriesDetails, compatibilitySubSeries };
