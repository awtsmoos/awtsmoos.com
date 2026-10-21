//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutesBasic
 * @description
 * Sibling of PlatformFeedRoutes: home, heichel, trending and discover feeds, relocated verbatim.
 */

const { TEST_ID_RE, cacheGet, cacheSet, postsFromIndex } = require('./feedRoutesCache.js');
const { recencyScore, engagementScore, followedAliasSet, baseScore, diversify, paginate } = require('./feedRoutesScore.js');

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

module.exports = {
	feedHome,
	feedHeichel,
	feedTrending,
	feedDiscover
};
