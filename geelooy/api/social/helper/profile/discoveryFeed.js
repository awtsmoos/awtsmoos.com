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
const { postsByAlias } = require('./posts.js');
const { commentsByAlias } = require('./comments.js');
const { recentActivity } = require('./activity.js');
const { safeRecordRead } = require('../safeguards/safeRecordRead.js');
const { readPacked, writePacked } = require('../packed/socialPacked.js');
const { logicalKey } = require('../packed/shardPaths.js');
const { createHash } = require('crypto');

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

/* B"H 2026-11-11 (site QA batch 15): the feed reads activity, not whole
 * profiles. The full-aggregation path above cost 0.5-88s PER ALIAS in
 * the service journal (posts/tree sections of aggregateProfile), times
 * up to 50 aliases serially — the public feed never returned at all.
 * Below: per alias, only the two streams recentActivity consumes,
 * bounded to 48 each (its window is 40), 4 aliases at a time, each
 * stream isolated so one poisoned alias degrades to silence instead
 * of killing the river. The composed river is cached for 60s: it is
 * viewer-independent (personalization happens in the enrichment
 * layers above), and a minute-old river is a fair price for one that
 * answers. */
const FEED_POSTS_LIMIT = 48;
const FEED_COMMENTS_LIMIT = 48;
const FEED_CONCURRENCY = 4;
const FEED_CACHE_TTL_MS = 60000;
const feedCache = new Map();

async function aliasActivity($i, aliasId) {
	const [posts, comments] = await Promise.all([
		safeRecordRead('feed:' + aliasId + ':posts', () => postsByAlias({ $i, aliasId, limit: FEED_POSTS_LIMIT }), { fallback: [] }),
		safeRecordRead('feed:' + aliasId + ':comments', () => commentsByAlias({ $i, aliasId, limit: FEED_COMMENTS_LIMIT }), { fallback: [] })
	]);
	return recentActivity({ posts, comments, limit: 40 })
		.map(item => ({ ...item, aliasId }));
}

async function mapBounded(items, limit, fn) {
	const output = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const index = next++;
			output[index] = await fn(items[index]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return output;
}

function riverCacheKey(aliases, query) {
	return JSON.stringify({
		a: [...aliases].sort(),
		k: csv(query.kind || query.kinds),
		c: csv(query.contentKind || query.contentKinds)
	});
}

function riverSnapshotKey(cacheKey) {
	return logicalKey(['feed', 'publicRiver', createHash('sha1').update(cacheKey).digest('hex').slice(0, 16)]);
}

function readRiverSnapshot($i, cacheKey) {
	try {
		const envelope = readPacked({ $i, shard: 'feed', key: riverSnapshotKey(cacheKey) });
		const value = envelope && envelope.op !== 'del' ? envelope.value : null;
		if (value && Array.isArray(value.items) && value.items.length) return value;
	} catch (_) { /* snapshot absent or unreadable: the inline build below still answers */ }
	return null;
}

function writeRiverSnapshot($i, cacheKey, items) {
	if (!items || !items.length) return;
	try {
		writePacked({
			$i, shard: 'feed', key: riverSnapshotKey(cacheKey),
			value: { kind: 'publicRiver', items, builtAt: Date.now() },
			meta: { kind: 'feed', feedType: 'publicRiver' }
		});
	} catch (_) { /* persistence is an optimization; the memory cache still serves */ }
}

async function buildRiver($i, aliases, query) {
	const perAlias = await mapBounded(aliases.slice(0, 50), FEED_CONCURRENCY, aliasId => aliasActivity($i, aliasId));
	const events = perAlias.flat();
	const byActivity = filterKinds(events, csv(query.kind || query.kinds));
	const byContent = filterContentKinds(byActivity, csv(query.contentKind || query.contentKinds));
	return byContent.sort((left, right) => {
		return (right.createdAt || right.time || 0) - (left.createdAt || left.time || 0);
	});
}

const feedRebuilding = new Set();

function rebuildRiverInBackground($i, cacheKey, aliases, query) {
	if (feedRebuilding.has(cacheKey)) return;
	feedRebuilding.add(cacheKey);
	buildRiver($i, aliases, query)
		.then(items => {
			if (!items.length) return;
			feedCache.set(cacheKey, { at: Date.now(), items });
			writeRiverSnapshot($i, cacheKey, items);
		})
		.catch(() => { /* keep serving the stale river; the next request retries */ })
		.finally(() => feedRebuilding.delete(cacheKey));
}

async function profileFeed({ $i, aliases = [], query = {} }) {
	const cacheKey = riverCacheKey(aliases, query);
	const hit = feedCache.get(cacheKey);
	if (hit && Date.now() - hit.at < FEED_CACHE_TTL_MS) return [...hit.items];
	if (hit) {
		// Stale-while-revalidate: the visitor gets the last river now;
		// the rebuild happens behind them, never inside their request.
		rebuildRiverInBackground($i, cacheKey, aliases, query);
		return [...hit.items];
	}
	const snapshot = readRiverSnapshot($i, cacheKey);
	if (snapshot) {
		feedCache.set(cacheKey, { at: snapshot.builtAt || 0, items: snapshot.items });
		rebuildRiverInBackground($i, cacheKey, aliases, query);
		return [...snapshot.items];
	}
	const items = await buildRiver($i, aliases, query);
	if (!items.length) return [...items];
	feedCache.set(cacheKey, { at: Date.now(), items });
	if (feedCache.size > 24) feedCache.delete(feedCache.keys().next().value);
	writeRiverSnapshot($i, cacheKey, items);
	return [...items];
}

async function trending({ $i, query = {} }) {
	return profileFeed({ $i, aliases: csv(query.aliases), query });
}

module.exports = { batchProfiles, contentKind, filterContentKinds, profileFeed, trending };
