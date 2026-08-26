// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteGroups
 * @description
 * The Awtsmoos gathers many search doors beneath one quiet map of light;
 * Awtsmoos.com keeps routing separate from warming, so each vessel stays small and right.
 */

const ROUTE_GROUPS = Object.freeze([
	{
		modulePath: './helper/search/routes/exact.js',
		factoryName: 'exactRoutes',
		routes: [
			'/search/exact/hebrew',
			'/search/exact/hebrew/meta'
		]
	},
	{
		modulePath: './helper/search/routes/tanach.js',
		factoryName: 'tanachRoutes',
		routes: [
			'/search/tanach/hebrew'
		]
	},
	{
		modulePath: './helper/search/routes/library.js',
		factoryName: 'libraryRoutes',
		routes: [
			'/search/library/shards',
			'/search/rag/shards',
			'/rag/search/shards',
			'/search/library/query',
			'/search/rag/query',
			'/rag/search/query',
			'/search/rag/llama/status'
		]
	},
	{
		modulePath: './helper/search/routes/comments.js',
		factoryName: 'commentRoutes',
		routes: [
			'/search/rag/comments/:comment',
			'/search/rag/post-comments'
		]
	}
]);

module.exports = {
	ROUTE_GROUPS
};
