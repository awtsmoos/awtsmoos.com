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
const { readPacked, excerptOf } = require('../packed/socialPacked.js');
const { logicalKey } = require('../packed/shardPaths.js');

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

/* ============================================================
 * B"H — Personalized feed ("For You").
 * Yaakov 2026-10-13: rank feed content from reading history.
 *
 * Signals (from reading analytics, server-side):
 *  - activeSeconds per post (real reading time, idle excluded)
 *  - maxScrollPercent (completion depth)
 *  - seriesId per session (series affinity)
 *
 * Scoring:
 *  - Series affinity: posts from heavily-read series score higher.
 *  - Related series: "related but still similar" — a Likkutei Sichos
 *    reader gets more Chassidus, not only Likkutei Sichos.
 *  - Deep reads: series where the user scrolled 80%+ get extra weight.
 *  - Already-read posts are demoted (not hidden — user may revisit).
 *  - Recency decay keeps the river fresh; engagement adds social proof.
 *  - Greedy diversity so one series never floods the feed.
 * New users (no history) fall back to the home ranking.
 * ============================================================ */

/** Series families for "related but still similar" expansion. */
const SERIES_FAMILIES = {
	chassidus: new Set([
		'chassidus', 'likkuteiSichos', 'likkuteiSichosVolume35', 'torahOhr',
		'torah-ohr-v6-rest', 'seferHatanya', 'likkuteiTorah', 'meluket',
		'sichosKodesh', 'derechMitzvosecha', 'seferHaMaamarim'
	]),
	tanach: new Set([
		'theWrittenTorah', 'tehillim', 'chumash', 'bereishis', 'shemos',
		'vayikra', 'bamidbar', 'devarim', 'neviim', 'kesuvim',
		'yehoshua', 'shoftim', 'shmuelAleph', 'shmuelBeis', 'melachimAleph',
		'melachimBeis', 'yeshayahu', 'yirmiyahu', 'yechezkel'
	]),
	oralTorah: new Set([
		'theOralTorah', 'mishnah', 'talmudBavli', 'mishnehTorah', 'yerushalmi',
		'halachah', 'midrash'
	])
};

/** Map a seriesId to its family name, or null. */
function seriesFamily(seriesId) {
	const s = String(seriesId || '');
	for (const [family, members] of Object.entries(SERIES_FAMILIES)) {
		if (members.has(s)) return family;
	}
	return null;
}

/**
 * Builds normalized affinity weights from reading history.
 * Returns { seriesWeight: Map(seriesId -> 0..1), familyWeight: Map(family -> 0..1), readPostIds: Set }.
 */
function buildAffinity(userId) {
	const seriesWeight = new Map();
	const familyWeight = new Map();
	const readPostIds = new Set();
	const deepReadSeries = new Set();

	try {
		const readingStore = require('../../reading/readingStore.js');

		// Recent sessions carry per-post signals.
		const sessions = readingStore.getRecentReads(userId, 50) || [];
		for (const s of sessions) {
			const postId = String(s.postId || '');
			if (postId) readPostIds.add(postId);
			const secs = Number(s.activeSeconds) || 0;
			const scroll = Number(s.maxScrollPercent) || 0;
			const sid = String(s.seriesId || '');
			if (!sid) continue;
			// Engagement weight: real seconds + completion bonus.
			const w = Math.log1p(secs / 30) + (scroll >= 80 ? 1.2 : scroll >= 50 ? 0.5 : 0);
			seriesWeight.set(sid, (seriesWeight.get(sid) || 0) + w);
			if (scroll >= 80) deepReadSeries.add(sid);
			const fam = seriesFamily(sid);
			if (fam) familyWeight.set(fam, (familyWeight.get(fam) || 0) + w * 0.6);
		}

		// Lifetime stats add durable series preference.
		const stats = readingStore.getStats(userId);
		const counts = (stats && stats.seriesCounts) || {};
		for (const [sid, count] of Object.entries(counts)) {
			const w = Math.log1p(Number(count) || 0) * 0.5;
			seriesWeight.set(sid, (seriesWeight.get(sid) || 0) + w);
			const fam = seriesFamily(sid);
			if (fam) familyWeight.set(fam, (familyWeight.get(fam) || 0) + w * 0.6);
			if (deepReadSeries.has(sid)) seriesWeight.set(sid, seriesWeight.get(sid) * 1.4);
		}
	} catch (_) {
		// No history or store unavailable — caller falls back to home ranking.
	}

	// Normalize to 0..1.
	const norm = (map) => {
		let max = 0;
		for (const v of map.values()) if (v > max) max = v;
		if (max <= 0) return map;
		for (const [k, v] of map) map.set(k, v / max);
		return map;
	};
	return { seriesWeight: norm(seriesWeight), familyWeight: norm(familyWeight), readPostIds };
}

/**
 * B"H 2026-10-13 (social-feed-audit): backfill excerpts at feed time.
 * Posts indexed before the excerptOf fix carry excerpt:"" — for those, read
 * the full post from the core shard once and compute. Results ride the
 * normal 25s rank cache, so this costs at most ~12 sync reads per cache miss.
 */
function enrichExcerpts($i, items) {
	for (const item of items) {
		if (item && !item.excerpt) {
			try {
				const key = logicalKey(['posts', item.heichelId || '', item.postId || item.id || '']);
				const rec = readPacked({ $i, shard: 'core', key });
				const full = rec && (rec.value || rec);
				const ex = full && excerptOf(full);
				if (ex) item.excerpt = ex;
			} catch (_) { /* leave bare */ }
		}
	}
	return items;
}

/** Latest feed: pure reverse-chronological, no ranking. */
function feedLatest({ $i, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `latest:${lim}:${offset}`;
	const cached = cacheGet(cacheKey);
	if (cached) return cached;
	const posts = postsFromIndex($i)
		.filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')))
		.sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
	const page = paginate(posts, lim, offset);
	page.items = enrichExcerpts($i, page.items);
	const out = { kind: 'latest', generatedAt: Date.now(), ranking: 'chronological', ...page };
	cacheSet(cacheKey, out);
	return out;
}

/** Popular feed: engagement-ranked, no personalization. */
function feedPopular({ $i, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `popular:${lim}:${offset}`;
	const cached = cacheGet(cacheKey);
	if (cached) return cached;
	const now = Date.now();
	const posts = postsFromIndex($i).filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));
	const scored = posts
		.map(post => ({ post, score: 0.65 * engagementScore(post) + 0.35 * recencyScore(post.updatedAt || post.createdAt, now) }))
		.sort((a, b) => b.score - a.score);
	const ranked = diversify(scored, 400);
	const page = paginate(ranked.map(r => ({ ...r.post, _rankScore: +r.rankedScore.toFixed(4) })), lim, offset);
	page.items = enrichExcerpts($i, page.items);
	const out = { kind: 'popular', generatedAt: now, ranking: 'engagement', ...page };
	cacheSet(cacheKey, out);
	return out;
}

/**
 * Personalized "For You" feed.
 * Falls back to home ranking when the user has no reading history.
 */
async function feedPersonalized({ $i, userId = '', aliasId = '', limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `personal:${userId || aliasId || 'anon'}:${lim}:${offset}`;
	const cached = cacheGet(cacheKey);
	if (cached) return cached;

	const now = Date.now();
	const { seriesWeight, familyWeight, readPostIds } = buildAffinity(userId);

	// No history → fall back to the standard home ranking.
	if (seriesWeight.size === 0 && familyWeight.size === 0) {
		const home = await feedHome({ $i, aliasId, limit: lim, offset });
		const out = { ...home, kind: 'personalized', ranking: home.ranking + '+fallback-no-history' };
		cacheSet(cacheKey, out);
		return out;
	}

	const followed = followedAliasSet($i, aliasId);
	const posts = postsFromIndex($i).filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));

	const scored = posts.map(post => {
		const postId = String(post.postId || post.id || '');
		const sid = String(post.seriesId || post.series || '');

		// Base: recency + engagement + follow affinity (same as home).
		let score = baseScore(post, followed, now);

		// Series affinity: direct preference.
		const sw = seriesWeight.get(sid) || 0;
		// Related-family: "related but still similar" expansion.
		const fam = seriesFamily(sid);
		const fw = (fam && !seriesWeight.has(sid)) ? (familyWeight.get(fam) || 0) * 0.55 : 0;

		score += 0.45 * sw + 0.25 * fw;

		// Demote (don't hide) already-read posts.
		if (readPostIds.has(postId)) score *= 0.35;

		return { post, score };
	}).sort((a, b) => b.score - a.score);

	// Diversity across series (not just alias) so one series never floods.
	const picked = [];
	const recentSeries = [];
	for (const entry of scored) {
		if (picked.length >= 400) break;
		const sid = String(entry.post.seriesId || entry.post.series || '');
		const repeats = recentSeries.filter(s => s === sid).length;
		const dampened = entry.score * Math.pow(0.5, repeats);
		picked.push({ post: entry.post, score: entry.score, rankedScore: dampened });
		recentSeries.push(sid);
		if (recentSeries.length > 5) recentSeries.shift();
	}
	picked.sort((a, b) => b.rankedScore - a.rankedScore);

	const page = paginate(picked.map(r => ({ ...r.post, _rankScore: +r.rankedScore.toFixed(4) })), lim, offset);
	const out = {
		kind: 'personalized', userId: userId || null, generatedAt: now,
		ranking: 'reading-history+series-affinity+related-family+diversity',
		signals: { series: seriesWeight.size, families: familyWeight.size, readPosts: readPostIds.size },
		...page
	};
	cacheSet(cacheKey, out);
	return out;
}

module.exports = { feedHome, feedHeichel, feedTrending, feedDiscover, feedLatest, feedPopular, feedPersonalized };
