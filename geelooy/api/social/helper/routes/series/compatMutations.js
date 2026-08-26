// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityMutations
 * @description
 * The Awtsmoos gathers old mutation dialects into one guarded adapter of Chesed and Gevurah;
 * Awtsmoos.com preserves historic clients while canonical domain helpers remain the single source of action Torah.
 */

const {
	addPostToSeries,
	changeSubSeriesFromOneSeriesToAnother,
	deletePostFromSeries,
	deleteSeriesFromHeichel,
	editSeriesDetails,
	editSubSeriesInSeries,
	makeNewSeries
} = require('../../index.js');
const {
	compatibilityAlias,
	compatibilityBody,
	compatibilityParent,
	isPostLike
} = require('./compatValues.js');

/** Deletes one series through the canonical destructive helper. */
function deleteSeriesCompatibility(
	$i,
	heichelId,
	seriesId,
	parentSeriesId = 'root'
) {
	return deleteSeriesFromHeichel({
		$i,
		heichelId,
		seriesId,
		parentSeriesId,
		userid: $i.userid
	});
}

/** Adds either a post or sub-series according to the legacy payload shape. */
function addCompatibleContent($i, heichelId) {
	if (!$i.$_POST) {
		$i.$_POST = {};
	}
	$i.$_POST.parentSeriesId = compatibilityParent($i);
	$i.$_POST.seriesId = $i.$_POST.seriesId
		|| $i.$_POST.parentSeriesId;
	if (isPostLike($i)) {
		return addPostToSeries({
			$i,
			heichelId,
			seriesId: $i.$_POST.seriesId
		});
	}
	return makeNewSeries({
		$i,
		heichelId
	});
}

/** Deletes either a post or sub-series according to the legacy payload shape. */
function deleteCompatibleContent($i, heichelId) {
	const input = compatibilityBody($i);
	const parentSeriesId = input.parentSeriesId
		|| input.seriesId
		|| 'root';
	if (input.postId || input.type === 'post') {
		return deletePostFromSeries({
			$i,
			heichelId,
			seriesId: parentSeriesId,
			postId: input.postId,
			userid: $i.userid
		});
	}
	return deleteSeriesCompatibility(
		$i,
		heichelId,
		input.subSeriesId || input.seriesId || input.id,
		parentSeriesId
	);
}

/** Edits legacy-compatible series details through the canonical helper. */
function editCompatibleSeries($i, heichelId, seriesId) {
	return editSeriesDetails({
		$i,
		heichelId,
		seriesId
	});
}

/** Reorders legacy-compatible sub-series references. */
function reorderCompatibleSubSeries($i, heichelId, seriesId) {
	return editSubSeriesInSeries({
		$i,
		heichelId,
		seriesId,
		aliasId: compatibilityAlias($i)
	});
}

/** Moves one sub-series between parents through the canonical domain helper. */
function moveCompatibleSubSeries($i, heichelId, seriesFrom, seriesTo) {
	return changeSubSeriesFromOneSeriesToAnother({
		$i,
		heichelId,
		seriesFrom,
		seriesTo,
		aliasId: compatibilityAlias($i)
	});
}

module.exports = {
	addCompatibleContent,
	deleteCompatibleContent,
	deleteSeriesCompatibility,
	editCompatibleSeries,
	moveCompatibleSubSeries,
	reorderCompatibleSubSeries
};
