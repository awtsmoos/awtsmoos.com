// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoverySearch
 * @description
 * The Awtsmoos preserves explicit alias-scoped search exactly while Awtsmoos.com opens omitted scopes to a bounded,
 * sanitized public namespace and expands expensive profile content only from the strongest public candidates.
 */
const { csv } = require('./apiTools.js');
const { batchProfiles } = require('./discoveryFeed.js');
const { publicPeople } = require('./publicAliases.js');
const { cleanText } = require('./sanitize.js');

const GLOBAL_ALIAS_RESULTS = 24;
const GLOBAL_PROFILE_EXPANSION = 12;

function aliasResultFromProfile(profile) {
	return {
		type: 'alias',
		id: profile.alias.id,
		title: profile.profile.displayName,
		text: profile.profile.bio,
		source: profile
	};
}

function aliasResultFromCard(card) {
	return {
		type: 'alias',
		id: card.id,
		title: card.name,
		text: card.description,
		source: {
			alias: { id: card.id },
			profile: { displayName: card.name, bio: card.description }
		}
	};
}

function profileContent(profile) {
	const items = [];
	for (const post of profile.posts || []) {
		items.push({ type: 'post', id: post.postId, title: post.title, text: post.excerpt, source: post });
	}
	for (const comment of profile.comments || []) {
		items.push({ type: 'comment', id: comment.id, title: comment.postTitle, text: comment.content, source: comment });
	}
	for (const heichel of profile.heichelos || []) {
		items.push({ type: 'heichel', id: heichel.id, title: heichel.name, text: heichel.description, source: heichel });
	}
	return items;
}

function matchesQuery(item, query) {
	if (!query) return true;
	return [item.id, item.title, item.text].join(' ').toLowerCase().includes(query);
}

function scopedResults(profiles, query) {
	const items = [];
	for (const profile of profiles) {
		items.push(aliasResultFromProfile(profile), ...profileContent(profile));
	}
	return query ? items.filter(item => matchesQuery(item, query)) : items;
}

async function scopedSearch({ $i, aliases, query }) {
	const profiles = await batchProfiles({ $i, aliases, query: { expand: 'full' } });
	return scopedResults(profiles, query);
}

async function globalSearch({ $i, query }) {
	const people = await publicPeople({
		$i,
		query: { q: query, page: 1, limit: GLOBAL_ALIAS_RESULTS }
	});
	const cards = Array.isArray(people.items) ? people.items : [];
	const aliases = cards.map(aliasResultFromCard);
	if (!query) return aliases;
	const candidateIds = cards.slice(0, GLOBAL_PROFILE_EXPANSION).map(card => card.id);
	const profiles = await batchProfiles({ $i, aliases: candidateIds, query: { expand: 'full' } });
	const content = profiles.flatMap(profileContent).filter(item => matchesQuery(item, query));
	return [...aliases, ...content];
}

async function search({ $i, query = {} }) {
	const q = cleanText(query.q || query.query || '', 120).toLowerCase();
	const aliases = csv(query.aliases);
	if (aliases.length) return scopedSearch({ $i, aliases, query: q });
	return globalSearch({ $i, query: q });
}

module.exports = {
	GLOBAL_ALIAS_RESULTS,
	GLOBAL_PROFILE_EXPANSION,
	aliasResultFromCard,
	matchesQuery,
	scopedResults,
	search
};
