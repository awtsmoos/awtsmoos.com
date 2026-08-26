// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityMutationRoutes
 * @description
 * The Awtsmoos lets historical mutation doors remain open while canonical helpers carry every real change;
 * Awtsmoos.com isolates legacy route dialects so future API evolution may be clean instead of strange.
 */

const { er } = require('../../index.js');
const {
	addCompatibleContent,
	deleteCompatibleContent,
	deleteSeriesCompatibility,
	editCompatibleSeries,
	moveCompatibleSubSeries,
	reorderCompatibleSubSeries
} = require('./compatMutations.js');
const {
	compatibilityBody,
	compatibilityIds
} = require('./compatValues.js');

/** Creates the legacy mutation route overlay without duplicating domain logic. */
function createSeriesCompatibilityMutationRoutes({ $i }) {
	return {
		'/heichelos/:heichel/addContentToSeries': async vars => {
			if ($i.request.method !== 'POST') {
				return er({ code: 'METHOD_NOT_ALLOWED' });
			}
			return addCompatibleContent($i, vars.heichel);
		},
		'/heichelos/:heichel/deleteContentFromSeries': async vars => {
			return deleteCompatibleContent($i, vars.heichel);
		},
		'/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId': async vars => {
			const parentSeriesId = $i.$_GET?.parentSeriesId
				|| compatibilityBody($i).parentSeriesId
				|| 'root';
			return deleteSeriesCompatibility(
				$i,
				vars.heichel,
				vars.seriesId,
				parentSeriesId
			);
		},
		'/heichelos/:heichel/series/:series/editSeriesDetails': async vars => {
			return editCompatibleSeries($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/:series/changePostsInSeries': async vars => {
			const input = compatibilityBody($i);
			return {
				success: {
					kept: true,
					route: 'compat',
					seriesId: vars.series,
					postIds: compatibilityIds(input.postIDs || input.postIds)
				}
			};
		},
		'/heichelos/:heichel/series/:series/changeSubSeriesInSeries': async vars => {
			return reorderCompatibleSubSeries($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/:seriesFrom/changeSubSeriesFromOneSeriesToAnother/:seriesTo': async vars => {
			return moveCompatibleSubSeries(
				$i,
				vars.heichel,
				vars.seriesFrom,
				vars.seriesTo
			);
		}
	};
}

module.exports = {
	createSeriesCompatibilityMutationRoutes
};
