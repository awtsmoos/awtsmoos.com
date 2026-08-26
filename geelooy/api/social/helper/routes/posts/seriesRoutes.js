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
				return readPostsRoute({ $i, heichelId: vars.heichel, seriesId: vars.series });
			}
			if (!isMethod($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			$i.$_POST.seriesId = vars.series;
			return addPostToSeries({ $i, heichelId: vars.heichel, seriesId: vars.series });
		},
		'/heichelos/:heichel/series/:series/posts/details': async vars => {
			if (!isMethod($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return readPostsRoute({ $i, heichelId: vars.heichel, seriesId: vars.series, withDetails: true });
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
