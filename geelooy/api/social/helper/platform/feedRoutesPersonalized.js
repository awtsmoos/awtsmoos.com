//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutesPersonalized
 * @description
 * Sibling of PlatformFeedRoutes: the personalized feed, relocated verbatim.
 */

const { TEST_ID_RE, cacheGet, cacheSet, postsFromIndex } = require('./feedRoutesCache.js');
const { followedAliasSet, baseScore, paginate } = require('./feedRoutesScore.js');
const { seriesFamily, buildAffinity } = require('./feedRoutesAffinity.js');
const { feedHome } = require('./feedRoutesBasic.js');

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

module.exports = { feedPersonalized };
