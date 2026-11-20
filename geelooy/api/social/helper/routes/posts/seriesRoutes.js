// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesPostRoutes
 * @description
 * The Awtsmoos gives post collection and post-item routes one bounded CRUD vessel;
 * Awtsmoos.com leaves virtual and packed compatibility beneath the reader service rather than inside every level.
 */

const {
	addPostToSeries,
	deletePostFromSeries,
	editPostInSeries,
	er,
	getPostsByProperty
} = require('../../index.js');
const {
	decodeRouteValue,
	isMethod
} = require('../requestValues.js');
const {
	readPostRoute,
	readPostsRoute,
	seriesPostsCacheKey,
	peekMemoizedRead
} = require('./readers.js');
const { selectedProperties, paginationRequested } = require('./readersQuery.js');

/**
 * B"H 2026-11-20 (ikar series load fix): when the read shed is closed,
 * a series post list that is already warm in the readCache costs
 * nothing to serve -- refusing it turned every series page into a
 * silent void whenever the heap ran hot. Returns the warm promise, or
 * null when the shed verdict must stand.
 */
function warmSeriesPosts($i, heichelId, seriesId, withDetails) {
	const key = seriesPostsCacheKey({
		heichelId,
		seriesId,
		withDetails,
		properties: selectedProperties($i),
		pagination: paginationRequested($i)
	});
	return peekMemoizedRead(key) || null;
}
const { bulkPublishRoute } = require('./bulkPublish.js');
const { readShed } = require('../../safeguards/readShed.js');
const { unavailable } = require('../apiHttp.js');

function deletionAlias($i) {
	const current = $i.$_DELETE || {};
	const aliasId = current.aliasId || $i.$_QUERY?.aliasId || $i.$_GET?.aliasId;
	$i.$_DELETE = { ...current, aliasId };
	return aliasId;
}

function createSeriesPostRoutes({ $i, userid }) {
	return {
		'/heichelos/:heichel/series/:series/posts': async vars => {
			if (isMethod($i, 'GET')) {
				// B"H 2026-10-20 (safeguards phase 3): heavy post listings
				// fail fast with 503 when the box is melting (circuit open,
				// heap hot, OS free RAM low) instead of piling a scan on a
				// frozen loop.
				const shed = readShed();
				if (shed) {
					const warm = warmSeriesPosts($i, vars.heichel, vars.series, false);
					if (warm) return warm;
					return unavailable('READ_SHED_OVERLOAD', shed.message);
				}
				return readPostsRoute({ $i, heichelId: vars.heichel, seriesId: vars.series });
			}
			if (!isMethod($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			$i.$_POST.seriesId = vars.series;
			return addPostToSeries({ $i, heichelId: vars.heichel, seriesId: vars.series });
		},
		'/heichelos/:heichel/series/:series/posts/details': async vars => {
			if (!isMethod($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			const shed = readShed();
			if (shed) {
				const warm = warmSeriesPosts($i, vars.heichel, vars.series, true);
				if (warm) return warm;
				return unavailable('READ_SHED_OVERLOAD', shed.message);
			}
			return readPostsRoute({ $i, heichelId: vars.heichel, seriesId: vars.series, withDetails: true });
		},
		'/heichelos/:heichel/series/:series/posts/bulk': async vars => {
			if (!isMethod($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return bulkPublishRoute({ $i, heichelId: vars.heichel, seriesId: vars.series });
		},
		'/heichelos/:heichel/series/:series/post/:post': async vars => {
			if (isMethod($i, 'GET')) {
				return readPostRoute({ $i, heichelId: vars.heichel, seriesId: vars.series, postId: vars.post });
			}
			if (isMethod($i, 'PUT')) {
				return editPostInSeries({ $i, heichelId: vars.heichel, seriesId: vars.series, postId: vars.post });
			}
			if (!isMethod($i, 'DELETE')) return er({ code: 'METHOD_NOT_ALLOWED' });
			if (!deletionAlias($i)) return er({ code: 'AUTH_NEEDED' });
			return deletePostFromSeries({ $i, heichelId: vars.heichel, seriesId: vars.series, postId: vars.post, userid });
		},
		'/heichelos/:heichel/series/:series/post/:post/delete': async vars => {
			// This suffix route used to run the deletion on ANY HTTP method
			// (including GET). deletePostFromSeries verifies the acting
			// alias internally (session ownership + heichel authority);
			// the route now also requires a mutation method, matching the
			// canonical DELETE route above.
			if (!isMethod($i, 'DELETE') && !isMethod($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return deletePostFromSeries({ $i, heichelId: vars.heichel, seriesId: vars.series, postId: vars.post, userid });
		},
		'/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal': async vars => {
			if (!isMethod($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return getPostsByProperty({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				propertyKey: decodeRouteValue(vars.propKey),
				propertyValue: decodeRouteValue(vars.propVal)
			});
		}
	};
}

module.exports = {
	createSeriesPostRoutes,
	deletionAlias
};
