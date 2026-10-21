//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutesGlobal
 * @description
 * Sibling of PlatformFeedRoutes: latest and popular feeds, relocated verbatim.
 */

const { GLOBAL_CACHE_TTL_MS, TEST_ID_RE, cacheGet, cacheSet, postsFromIndex } = require('./feedRoutesCache.js');
const { recencyScore, engagementScore, diversify, paginate } = require('./feedRoutesScore.js');

/** Latest feed: pure reverse-chronological, no ranking. */
function feedLatest({ $i, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `latest:${lim}:${offset}`;
	const cached = cacheGet(cacheKey, GLOBAL_CACHE_TTL_MS);
	if (cached) return cached;
	const posts = postsFromIndex($i)
		.filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')))
		.sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
	const page = paginate(posts, lim, offset);
	const out = { kind: 'latest', generatedAt: Date.now(), ranking: 'chronological', ...page };
	cacheSet(cacheKey, out);
	return out;
}

/** Popular feed: engagement-ranked, no personalization. */
function feedPopular({ $i, limit = 50, offset = 0 }) {
	const lim = Math.min(100, Math.max(1, Number(limit) || 50));
	const cacheKey = `popular:${lim}:${offset}`;
	const cached = cacheGet(cacheKey, GLOBAL_CACHE_TTL_MS);
	if (cached) return cached;
	const now = Date.now();
	const posts = postsFromIndex($i).filter(p => !TEST_ID_RE.test(String(p.postId || p.id || '')));
	const scored = posts
		.map(post => ({ post, score: 0.65 * engagementScore(post) + 0.35 * recencyScore(post.updatedAt || post.createdAt, now) }))
		.sort((a, b) => b.score - a.score);
	const ranked = diversify(scored, 400);
	const page = paginate(ranked.map(r => ({ ...r.post, _rankScore: +r.rankedScore.toFixed(4) })), lim, offset);
	const out = { kind: 'popular', generatedAt: now, ranking: 'engagement', ...page };
	cacheSet(cacheKey, out);
	return out;
}

module.exports = {
	feedLatest,
	feedPopular
};
