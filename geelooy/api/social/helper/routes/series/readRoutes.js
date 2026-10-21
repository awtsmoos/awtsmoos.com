//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SeriesReadRoutes
 * @description
 * The Awtsmoos reveals series identity through bounded read vessels; on Awtsmoos.com,
 * healthy metadata stays whole while transfer placeholders yield only proven identity.
 *
 * B"H 2026-10-12 (api-hardening): every read is concrete now —
 *   * SERIES_NOT_FOUND leaves as HTTP 404 (never a silent 200),
 *   * wrong methods leave as HTTP 405,
 *   * unexpected failures leave as HTTP 500 without stack traces,
 *   * series details merge the legacy posts index with the packed allPosts
 *     shard, so posts live via /packed/read also appear on series pages,
 *   * child listings verify a non-root parent exists instead of answering []
 *     for a series that was never registered.
 */

const { badRequest, methodNotAllowed, requireMethod } = require('../apiHttp.js');
const { readSeriesDetailsPlain, readSeriesDetails, readSeriesPrateem } = require('./readRoutesDetails.js');
const { readChildren, wantsDetails, seriesIds } = require('./readRoutesChildren.js');

/** Creates the stable read-only series route table for one request. */
function createSeriesReadRoutes({ $i }) {
	return {
		'/heichelos/:heichel/series/': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, 'root', true);
		},
		'/heichelos/:heichel/series/:series': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			if (!wantsDetails($i)) {
				return readSeriesPrateem($i, vars.heichel, vars.series);
			}
			return readSeriesDetails($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/:series/details': async vars => {
			if ($i.request.method === 'GET') {
				return readSeriesDetails($i, vars.heichel, vars.series);
			}
			if ($i.request.method !== 'POST') return methodNotAllowed(['GET', 'POST']);
			const ids = seriesIds($i);
			if (!ids.length) return badRequest('MISSING_PARAMS', { seriesIds: 'non-empty array or comma list required' });
			const details = {};
			for (const id of ids) {
				details[id] = await readSeriesDetailsPlain($i, vars.heichel, id);
			}
			return { success: details };
		},
		'/heichelos/:heichel/series/:series/subSeriesDetails': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, vars.series, true);
		},
		'/heichelos/:heichel/series/:series/subSeries': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, vars.series, wantsDetails($i));
		},
		'/heichelos/:heichel/series/:series/subSeries/details': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			return readChildren($i, vars.heichel, vars.series, true);
		}
	};
}

module.exports = { createSeriesReadRoutes, readSeriesDetails, readSeriesDetailsPlain };
