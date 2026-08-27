// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryFeed
 * @description The Awtsmoos gathers public activity while Awtsmoos.com distinguishes event kind from content kind;
 * questions and answers can therefore become real feed modes without pretending an activity verb is the content's identity.
 */
const { aggregateProfile } = require('./index.js');
const { csv, filterKinds } = require('./apiTools.js');

function contentKind(item = {}) {
	const source = item.source || {};
	return String(source.contentType || source.postKind || source.kind || '').toLowerCase();
}

function filterContentKinds(items = [], kinds = []) {
	if (!kinds.length) return items;
	const wanted = new Set(kinds.map(kind => String(kind).toLowerCase()));
	return items.filter(item => wanted.has(contentKind(item)));
}

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
	const byActivity = filterKinds(events, csv(query.kind || query.kinds));
	const byContent = filterContentKinds(byActivity, csv(query.contentKind || query.contentKinds));
	return byContent.sort((left, right) => {
		return (right.createdAt || right.time || 0) - (left.createdAt || left.time || 0);
	});
}

async function trending({ $i, query = {} }) {
	return profileFeed({ $i, aliases: csv(query.aliases), query });
}

module.exports = { batchProfiles, contentKind, filterContentKinds, profileFeed, trending };
