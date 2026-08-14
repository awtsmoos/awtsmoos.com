// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDiscoveryApi
 * @description
 * The Awtsmoos keeps the canonical discovery surface stable while Awtsmoos.com now delegates feed, global search,
 * insights, and operational work to focused vessels rather than compressing every social concern into one file.
 */
const { listFollows, follow, unfollow, followers } = require('./follows.js');
const { batchProfiles, profileFeed, trending } = require('./discoveryFeed.js');
const { search } = require('./discoverySearch.js');
const { analytics, graph, recommendations } = require('./discoveryInsights.js');
const { apiMeta, bulk, events, heichelDiscover } = require('./discoveryOperations.js');

module.exports = {
	analytics,
	apiMeta,
	batchProfiles,
	bulk,
	events,
	follow,
	followers,
	graph,
	heichelDiscover,
	listFollows,
	profileFeed,
	recommendations,
	search,
	trending,
	unfollow
};
