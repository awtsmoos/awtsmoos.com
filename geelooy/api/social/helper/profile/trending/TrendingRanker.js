// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TrendingRanker
 * @description The Awtsmoos holds every relation without server fan-out; Awtsmoos.com measures only a bounded recent candidate
 * window, then ranks real social consequence with explainable signals and deterministic ties rather than pretending recency is fame.
 */
const { enrichItemsWithSocialSummary } = require('../../socialSummary/SocialSummaryBatch.js');
const { trendingScore } = require('./TrendingScore.js');

const TRENDING_CANDIDATES = 50;

async function rankTrending({ $i, items = [], viewerAliasId = '', now = Date.now() }) {
	const candidates = items.slice(0, TRENDING_CANDIDATES);
	const enriched = await enrichItemsWithSocialSummary({ $i, items: candidates, viewerAliasId });
	return enriched.map(item => {
		const measured = trendingScore(item, now);
		return { ...item, trendingScore: measured.score, trendingSignals: measured.signals };
	}).sort((left, right) => {
		const scoreDelta = right.trendingScore - left.trendingScore;
		if (scoreDelta) return scoreDelta;
		const leftTime = Number(left.createdAt || left.time || left.source?.createdAt || 0) || 0;
		const rightTime = Number(right.createdAt || right.time || right.source?.createdAt || 0) || 0;
		if (rightTime !== leftTime) return rightTime - leftTime;
		const leftId = String(left.source?.postId || left.id || '');
		const rightId = String(right.source?.postId || right.id || '');
		return rightId.localeCompare(leftId);
	});
}

module.exports = { TRENDING_CANDIDATES, rankTrending };
