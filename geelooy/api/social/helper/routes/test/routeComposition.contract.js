// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRouteCompositionContract
 * @description
 * The Awtsmoos remembers every public door while internal vessels are rearranged beneath the light;
 * Awtsmoos.com may refactor without silently losing a route, because this contract keeps the surface right.
 */

const assert = require('node:assert/strict');
const {
	createSeriesReadRoutes
} = require('../series/readRoutes.js');
const {
	createSeriesNavigationRoutes
} = require('../series/navigationRoutes.js');
const {
	createSeriesMutationRoutes
} = require('../series/mutationRoutes.js');
const {
	createAliasPostRoutes
} = require('../posts/aliasRoutes.js');
const {
	createPostSubmissionRoutes
} = require('../posts/submissionRoutes.js');
const {
	createSeriesPostRoutes
} = require('../posts/seriesRoutes.js');

const SERIES_ROUTES = [
	'/heichelos/:heichel/addNewSeries',
	'/heichelos/:heichel/deleteSeries/:seriesId',
	'/heichelos/:heichel/series/',
	'/heichelos/:heichel/series/:parentSeriesId/clearSubSeries/:seriesId',
	'/heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId',
	'/heichelos/:heichel/series/:series',
	'/heichelos/:heichel/series/:series/breadcrumb',
	'/heichelos/:heichel/series/:series/changeSubSeriesInSeries',
	'/heichelos/:heichel/series/:series/details',
	'/heichelos/:heichel/series/:series/editSeriesDetails',
	'/heichelos/:heichel/series/:series/filterSeriesBy/:propKey/:propVal',
	'/heichelos/:heichel/series/:series/parent',
	'/heichelos/:heichel/series/:series/subSeries',
	'/heichelos/:heichel/series/:series/subSeries/details',
	'/heichelos/:heichel/series/:series/subSeriesDetails',
	'/heichelos/:heichel/series/:seriesFrom/moveSubSeriesTo/:seriesTo'
].sort();

const POST_ROUTES = [
	'/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive',
	'/aliases/:alias/postsMade/heichel/:heichel/series',
	'/aliases/:alias/postsMade/heichelos',
	'/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal',
	'/heichelos/:heichel/series/:series/post/:post',
	'/heichelos/:heichel/series/:series/post/:post/delete',
	'/heichelos/:heichel/series/:series/posts',
	'/heichelos/:heichel/series/:series/posts/details',
	'/heichelos/:heichel/submittedPosts',
	'/heichelos/:heichel/submittedPosts/approve',
	'/heichelos/:heichel/submittedPosts/deny'
].sort();

function fakeInterface() {
	return {
		request: { method: 'GET' },
		$_GET: {},
		$_POST: {},
		$_PUT: {},
		$_DELETE: {},
		$_QUERY: {}
	};
}

function routeKeys() {
	const $i = fakeInterface();
	return {
		series: Object.keys({
			...createSeriesReadRoutes({ $i }),
			...createSeriesNavigationRoutes({ $i }),
			...createSeriesMutationRoutes({ $i, userid: 'contract' })
		}).sort(),
		posts: Object.keys({
			...createAliasPostRoutes({ $i }),
			...createPostSubmissionRoutes({ $i }),
			...createSeriesPostRoutes({ $i, userid: 'contract' })
		}).sort()
	};
}

const actual = routeKeys();
assert.deepEqual(actual.series, SERIES_ROUTES);
assert.deepEqual(actual.posts, POST_ROUTES);
console.log(`B"H route composition contract passed: ${actual.series.length} series + ${actual.posts.length} posts.`);
process.exit(0);
