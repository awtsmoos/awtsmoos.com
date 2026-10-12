//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PlatformFeedRoutes
 * @description
 * Yaakov 2026-10-11: the social feed is now a smart ranked river, not a
 * timestamp sort. Home ranking blends recency decay, engagement velocity,
 * alias affinity, and a diversity guard so one voice never floods the river.
 * Trending measures real recent engagement velocity (test/smoke fixtures are
 * excluded). All feeds paginate via offset and share a short-TTL rank cache
 * so the river stays fast under load.
 */
const { list } = require('./platformStore.js');
const { listRelationships } = require('./follow.js');

const CACHE_TTL_MS = 25000;
const rankCache = new Map();

const TEST_ID_RE = /(smoke|test|fixture|sample)/i;

function cacheGet(key) {
	const hit = rankCache.get(key);
	if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
	rankCache.delete(key);
	return null;
}
function cacheSet(key, value) {
	rankCache.set(key, { at: Date.now(), value });
	if (rankCache.size > 60) {
		const oldest = rankCache.keys().next().value;
		rankCache.delete(oldest);
	}
}

function postsFromIndex($i) {
	try {
		return list({ $i, shard: 'search', predicate: r => r.meta && r.meta.index === 'postsByHeichel' })
			.map(r => r.value)
			.filter(Boolean);
	} catch (_) {
		return [];
	}
}

function asArray(maybe) {
	return Array.isArray(maybe) ? maybe : [];
}

/** Exponential recency decay: ~72h half-life. */
function recencyScore(updatedAt, now) {
	const ageHrs = Math.max(0, (now - (Number(updatedAt) || 0)) / 3600000);
	return Math.exp(-ageHrs / 72);
}

/** Log-scaled engagement in [0,1). */
function engagementScore(post) {
	const comments = Number(post.commentCount) || 0;
	const reactions = Number(post.reactionCount) || 0;
	const shares = Number(post.shareCount) || 0;
	return Math.log1p(comments * 3 + reactions + shares * 2) / Math.log1p(120);
}

function followedAliasSet($i, aliasId) {
	if (!aliasId || aliasId === 'anonymous') return new Set();
	try {
		const rels = listRelationships({ $i, aliasId, type: 'follow' }) || [];
		return new Set(asArray(rels).map(r => String(r.toAlias || r.targetId || r.to || '')).filter(Boolean));
	} catch (_) {
		return new Set();
	}
}

function baseScore(post, followed, now) {
	const recency = recencyScore(post.updatedAt || post.createdAt, now);
	const engagement = engagementScore(post);
	const affinity = followed.has(String(post.aliasId || post.author || '')) ? 1 : 0;
	return 0.55 * recency + 0.30 * engagement + 0.15 * affinity;
}

/**
 * Greedy diversity: walk the score-sorted list, dampening repeats of the
 * same alias within a short window so the river stays varied.
 */
function diversify(scored, limit) {
	const picked = [];
	const recentAliases = [];
	for (const entry of scored) {
		if (picked.length >= limit) break;
		const alias = String(entry.post.aliasId || entry.post.author || '');
		const repeats = recentAliases.filter(a => a === alias).length;
		const dampened = entry.score * Math.pow(0.45, repeats);
		picked.push({ post: entry.post, score: entry.score, rankedScore: dampened });
		recentAliases.push(alias);
		if (recentAliases.length > 4) recentAliases.shift();
	}
	return picked.sort((a, b) => b.rankedScore - a.rankedScore);
}

function paginate(items, limit, offset) {
	const start = Math.max(0, Number(offset) || 0);
	const page = items.slice(start, start + limit);
	return {
		items: page,
		nextOffset: start + page.length < items.length ? start + page.length : null,
		total: items.length
	};
}

async function feedHome({ $i, aliasId = '', limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `home:${aliasId || 'anon'}:${lim}:${offset}`;
	const cached = cacheGet(cacheKey);
	if (cached) return cached;
	const now = Date.now();
	const followed = followedAliasSet($i, aliasId);
	const posts = postsFromIndex($i).filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));
	const scored = posts
		.map(post => ({ post, score: baseScore(post, followed, now) }))
		.sort((a, b) => b.score - a.score);
	const ranked = diversify(scored, 400);
	const page = paginate(ranked.map(r => ({ ...r.post, _rankScore: +r.rankedScore.toFixed(4) })), lim, offset);
	const out = {
		kind: 'home', aliasId, generatedAt: now, ranking: 'recency+engagement+affinity+diversity',
		...page
	};
	cacheSet(cacheKey, out);
	return out;
}

async function feedHeichel({ $i, heichelId, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const now = Date.now();
	const posts = postsFromIndex($i)
		.filter(p => !heichelId || p.heichelId === heichelId)
		.filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));
	const scored = posts
		.map(post => ({ post, score: 0.7 * recencyScore(post.updatedAt || post.createdAt, now) + 0.3 * engagementScore(post) }))
		.sort((a, b) => b.score - a.score);
	const page = paginate(scored.map(s => ({ ...s.post, _rankScore: +s.score.toFixed(4) })), lim, offset);
	return { kind: 'heichel', heichelId, generatedAt: now, ...page };
}

/** Real trending: engagement velocity over the trailing 48h window. */
async function feedTrending({ $i, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `trending:${lim}:${offset}`;
	const cached = cacheGet(cacheKey);
	if (cached) return cached;
	const now = Date.now();
	const windowStart = now - 48 * 3600000;
	const posts = postsFromIndex($i).filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));
	const scored = [];
	for (const post of posts) {
		const updatedAt = Number(post.updatedAt || post.createdAt || 0);
		if (updatedAt < windowStart) continue;
		const velocity = engagementScore(post) * recencyScore(updatedAt, now);
		if (velocity > 0.001) scored.push({ post, score: velocity });
	}
	scored.sort((a, b) => b.score - a.score);
	const page = paginate(scored.map(s => ({ ...s.post, _trendScore: +s.score.toFixed(4) })), lim, offset);
	const out = { kind: 'trending', generatedAt: now, windowHours: 48, ...page };
	cacheSet(cacheKey, out);
	return out;
}

/** Discover: stable rotation across voices — deterministic shuffle by day. */
async function feedDiscover({ $i, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const daySeed = Math.floor(Date.now() / 86400000);
	const posts = postsFromIndex($i).filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));
	const hashed = posts.map(post => {
		const key = String(post.postId || post.id || '');
		let h = daySeed;
		for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) | 0;
		return { post, h: h >>> 0 };
	}).sort((a, b) => a.h - b.h);
	const page = paginate(hashed.map(x => x.post), lim, offset);
	return { kind: 'discover', generatedAt: Date.now(), rotation: 'daily', ...page };
}

module.exports = { feedHome, feedHeichel, feedTrending, feedDiscover };
