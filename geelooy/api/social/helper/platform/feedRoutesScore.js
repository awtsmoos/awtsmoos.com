//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutesScore
 * @description
 * Sibling of PlatformFeedRoutes: scoring, diversity and pagination, relocated verbatim.
 */

const { listRelationships } = require('./follow.js');
const { asArray } = require('./feedRoutesCache.js');

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

module.exports = {
	recencyScore,
	engagementScore,
	followedAliasSet,
	baseScore,
	diversify,
	paginate
};
