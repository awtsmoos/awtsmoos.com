// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteGroups
 * @description
 * The Awtsmoos gathers exact, lexical, semantic, and library doors beneath one quiet map of light;
 * Awtsmoos.com keeps each route family lazy and isolated, so a new search vessel never burdens unrelated flight.
 */

const ROUTE_GROUPS = Object.freeze([
	{
		modulePath: './helper/search/routes/capabilities.js',
		factoryName: 'capabilityRoutes',
		routes: ['/search/capabilities']
	},
	{
		modulePath: './helper/search/routes/exact.js',
		factoryName: 'exactRoutes',
		routes: ['/search/exact/hebrew', '/search/exact/hebrew/meta']
	},
	{
		modulePath: './helper/search/routes/tanach.js',
		factoryName: 'tanachRoutes',
		routes: ['/search/tanach/hebrew', '/search/tanach/native']
	},
	{
		modulePath: './helper/search/routes/lexicon.js',
		factoryName: 'lexiconRoutes',
		routes: ['/search/library/dictionary', '/search/library/dictionaries']
	},
	{
		modulePath: './helper/search/routes/semantic.js',
		factoryName: 'semanticRoutes',
		routes: ['/search/semantic']
	},
	{
		modulePath: './helper/search/routes/library.js',
		factoryName: 'libraryRoutes',
		routes: [
			'/search/library/shards',
			'/search/rag/shards',
			'/rag/search/shards',
			'/search/library/query',
			'/search/library/browse',
			'/search/rag/query',
			'/rag/search/query',
			'/search/rag/llama/status'
		]
	},
	{
		modulePath: './helper/search/routes/comments.js',
		factoryName: 'commentRoutes',
		routes: ['/search/rag/comments/:comment', '/search/rag/post-comments']
	}
]);

module.exports = { ROUTE_GROUPS };
