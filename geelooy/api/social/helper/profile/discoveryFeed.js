// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryFeed
 * @description
 * The Awtsmoos gathers explicitly scoped public profiles into feed and trending vessels while Awtsmoos.com keeps
 * anonymous public-universe selection in its dedicated discovery route instead of duplicating source authority.
 */
const { aggregateProfile } = require('./index.js');
const { csv, filterKinds } = require('./apiTools.js');

async function batchProfiles({ $i, aliases = [], query = {} }) {
	const output = [];
	const expand = new Set(csv(query.expand));
	for (const aliasId of aliases.slice(0, 50)) {
		const profile = await aggregateProfile({ $i, aliasId });
		if (!profile) continue;
		if (expand.has('full')) {
			output.push(profile);
			continue;
		}
		output.push({
			alias: profile.alias,
			profile: profile.profile,
			stats: profile.stats,
			activity: profile.activity?.slice(0, 8) || [],
			history: expand.has('history') ? profile.history : undefined
		});
	}
	return output;
}

async function profileFeed({ $i, aliases = [], query = {} }) {
	const profiles = await batchProfiles({ $i, aliases, query: { ...query, expand: 'full' } });
	const events = profiles.flatMap(profile => {
		return (profile.activity || []).map(item => ({ ...item, aliasId: profile.alias.id }));
	});
	return filterKinds(events, csv(query.kind || query.kinds)).sort((left, right) => {
		return (right.createdAt || right.time || 0) - (left.createdAt || left.time || 0);
	});
}

async function trending({ $i, query = {} }) {
	const feed = await profileFeed({ $i, aliases: csv(query.aliases), query });
	return feed.map((item, index) => ({
		...item,
		trendingScore: 1000 - index
			+ Number(item.source?.commentsCount || 0)
			+ Number(item.source?.sectionsCount || 0)
	}));
}

module.exports = { batchProfiles, profileFeed, trending };
