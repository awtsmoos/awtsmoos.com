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
	readPostsRoute
} = require('./readers.js');
// B"H 2026-11-20 (ikar series round 2): the cache-key builder and the
// memo peek are imported from their canonical homes, NOT through the
// readers.js re-export shim. During the round-1 staged upload the
// running process froze a module graph whose shim exports were
// undefined while these homes were already current; combined with a
// permanently-on read shed (heap above the guard line), every posts
// request died in warmSeriesPosts with "seriesPostsCacheKey is not a
// function" (HTTP 500) before ever reaching the working read path.
const { seriesPostsCacheKey } = require('./readersPosts.js');
const { peekMemoizedRead } = require('../../profile/readCache.js');
const { selectedProperties, paginationRequested } = require('./readersQuery.js');

/**
 * B"H 2026-11-20 (ikar series load fix): when the read shed is closed,
 * a series post list that is already warm in the readCache costs
 * nothing to serve -- refusing it turned every series page into a
 * silent void whenever the heap ran hot. Returns the warm promise, or
 * null when the shed verdict must stand.
 *
 * B"H 2026-11-20 (round 2): an admission gate must never throw. Any
 * failure inside the peek (missing helper, bad key inputs) degrades
 * to null, so the route answers with the honest shed verdict (503)
 * instead of a route-error 500.
 */
function warmSeriesPosts($i, heichelId, seriesId, withDetails) {
	try {
		if (typeof seriesPostsCacheKey !== 'function'
			|| typeof peekMemoizedRead !== 'function') return null;
		const key = seriesPostsCacheKey({
			heichelId,
			seriesId,
			withDetails,
			properties: selectedProperties($i),
			pagination: paginationRequested($i)
		});
		return peekMemoizedRead(key) || null;
	} catch (_) {
		return null;
	}
}
const { bulkPublishRoute } = require('./bulkPublish.js');
const { readShed, tryAdmitColdFill } = require('../../safeguards/readShed.js');
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
					// B"H 2026-11-20 (shed-warming): the memo can only
					// warm through this read, and the resting heap sits
					// above the shed line permanently — refusing every
					// cold fill starved the cache forever. Admit one
					// bounded cold fill (see safeguards/readShed.js);
					// when the budget is spent, the honest 503 stands.
					const release = tryAdmitColdFill();
					if (!release) return unavailable('READ_SHED_OVERLOAD', shed.message);
					try {
						return await readPostsRoute({ $i, heichelId: vars.heichel, seriesId: vars.series });
					} finally {
						release();
					}
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
				// B"H 2026-11-20 (shed-warming): same bounded cold-fill
				// admission as the ids list above — a cold memo under a
				// permanent shed must be able to warm, one walk at a
				// time, or this route answers 503 forever.
				const release = tryAdmitColdFill();
				if (!release) return unavailable('READ_SHED_OVERLOAD', shed.message);
				try {
					return await readPostsRoute({ $i, heichelId: vars.heichel, seriesId: vars.series, withDetails: true });
				} finally {
					release();
				}
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
