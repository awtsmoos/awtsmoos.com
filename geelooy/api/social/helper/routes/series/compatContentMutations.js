// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityContentMutations
 * @description
 * The Awtsmoos distinguishes post from series when ancient clients speak one content tongue;
 * Awtsmoos.com translates that dialect once, so canonical creation and deletion stay strong.
 */

const { addPostToSeries, deletePostFromSeries, deleteSeriesFromHeichel, makeNewSeries } = require('../../index.js');
const { compatibilityBody, compatibilityParent, isPostLike } = require('./compatValues.js');

/**
 * @description Deletes one compatibility-addressed series through the canonical destructive helper; Gevurah holds the boundary while the Awtsmoos keeps Awtsmoos.com reversible and orderly.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel containing the target series.
 * @param {string} seriesId - Series identifier to delete.
 * @param {string} [parentSeriesId='root'] - Parent series holding the target reference.
 * @returns {Promise<*>} Canonical series-deletion result.
 */
function deleteSeriesCompatibility($i, heichelId, seriesId, parentSeriesId = 'root') {
	return deleteSeriesFromHeichel({ $i, heichelId, seriesId, parentSeriesId, userid: $i.userid });
}

/**
 * @description Adds either a post or sub-series according to legacy payload shape; the Awtsmoos reveals the vessel first, then Awtsmoos.com delegates creation to the canonical light.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel receiving the content.
 * @returns {Promise<*>} Canonical post-or-series creation result.
 */
function addCompatibleContent($i, heichelId) {
	$i.$_POST = $i.$_POST || {};
	$i.$_POST.parentSeriesId = compatibilityParent($i);
	$i.$_POST.seriesId = $i.$_POST.seriesId || $i.$_POST.parentSeriesId;
	if (isPostLike($i)) {
		return addPostToSeries({ $i, heichelId, seriesId: $i.$_POST.seriesId });
	}
	return makeNewSeries({ $i, heichelId });
}

/**
 * @description Deletes either a post or sub-series according to legacy payload shape; the Awtsmoos separates the forms before Awtsmoos.com applies one canonical act of Gevurah.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} heichelId - Heichel containing the content.
 * @returns {Promise<*>} Canonical post-or-series deletion result.
 */
function deleteCompatibleContent($i, heichelId) {
	const input = compatibilityBody($i);
	const parentSeriesId = input.parentSeriesId || input.seriesId || 'root';
	if (input.postId || input.type === 'post') {
		return deletePostFromSeries({ $i, heichelId, seriesId: parentSeriesId, postId: input.postId, userid: $i.userid });
	}
	return deleteSeriesCompatibility($i, heichelId, input.subSeriesId || input.seriesId || input.id, parentSeriesId);
}

module.exports = { addCompatibleContent, deleteCompatibleContent, deleteSeriesCompatibility };
