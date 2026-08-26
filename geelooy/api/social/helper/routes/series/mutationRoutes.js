// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesMutationRoutes
 * @description
 * The Awtsmoos gathers series creation, movement, editing, and deletion behind one guarded vessel;
 * Awtsmoos.com normalizes authorization bodies once so every destructive path stays readable and level.
 */

const {
	changeSubSeriesFromOneSeriesToAnother,
	deleteSeriesFromHeichel,
	editSeriesDetails,
	editSubSeriesInSeries,
	makeNewSeries,
	er
} = require('../../index.js');

function allowed($i, methods) {
	return methods.includes($i.request.method);
}

function normalizeDeleteAlias($i) {
	const post = $i.$_POST || {};
	const deletion = $i.$_DELETE || {};
	const aliasId = post.aliasId || deletion.aliasId || $i.$_QUERY?.aliasId || $i.$_GET?.aliasId;
	$i.$_POST = { ...post, aliasId };
	$i.$_DELETE = { ...deletion, aliasId };
	return aliasId;
}

function createSeriesMutationRoutes({ $i, userid }) {
	return {
		'/heichelos/:heichel/addNewSeries': async vars => {
			if (!allowed($i, ['POST'])) return er({ code: 'METHOD_NOT_ALLOWED' });
			return makeNewSeries({ $i, heichelId: vars.heichel });
		},
		'/heichelos/:heichel/series/:series/editSeriesDetails': async vars => {
			if (!allowed($i, ['PUT'])) return er({ code: 'METHOD_NOT_ALLOWED' });
			return editSeriesDetails({ $i, heichelId: vars.heichel, seriesId: vars.series });
		},
		'/heichelos/:heichel/series/:series/changeSubSeriesInSeries': async vars => {
			if (!allowed($i, ['PUT'])) return er({ code: 'METHOD_NOT_ALLOWED' });
			return editSubSeriesInSeries({ $i, heichelId: vars.heichel, seriesId: vars.series });
		},
		'/heichelos/:heichel/series/:seriesFrom/moveSubSeriesTo/:seriesTo': async vars => {
			if (!allowed($i, ['POST'])) return er({ code: 'METHOD_NOT_ALLOWED' });
			return changeSubSeriesFromOneSeriesToAnother({
				$i, heichelId: vars.heichel, seriesFromId: vars.seriesFrom, seriesToId: vars.seriesTo
			});
		},
		'/heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId': async vars => {
			if (!allowed($i, ['DELETE', 'POST'])) return er({ code: 'METHOD_NOT_ALLOWED' });
			if (!normalizeDeleteAlias($i)) return er({ code: 'AUTH_NEEDED', details: 'aliasId required' });
			return deleteSeriesFromHeichel({
				$i, userid, heichelId: vars.heichel, parentSeriesId: vars.parentSeriesId, seriesId: vars.seriesId
			});
		},
		'/heichelos/:heichel/series/:parentSeriesId/clearSubSeries/:seriesId': async vars => {
			if (!allowed($i, ['DELETE', 'POST'])) return er({ code: 'METHOD_NOT_ALLOWED' });
			if (!normalizeDeleteAlias($i)) return er({ code: 'AUTH_NEEDED', details: 'aliasId required' });
			return deleteSeriesFromHeichel({
				$i, userid, heichelId: vars.heichel, deleteSelf: false, parentSeriesId: vars.parentSeriesId, seriesId: vars.seriesId
			});
		},
		'/heichelos/:heichel/deleteSeries/:seriesId': async () => {
			return er({
				message: 'API HAS MOVED',
				moved: '/heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId'
			});
		}
	};
}

module.exports = { createSeriesMutationRoutes, normalizeDeleteAlias };
