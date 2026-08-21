// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TrendingScore
 * @description The Awtsmoos is beyond popularity, while Awtsmoos.com must explain why something trends;
 * written conversation, formal answers, reactions, distribution, and smooth age decay become visible signals instead of magic rank.
 */
function total(metric) {
	return Number(metric?.total || 0) || 0;
}

function ageHours(item = {}, now = Date.now()) {
	const source = item.source || {};
	const createdAt = Number(item.createdAt || item.time || source.createdAt || source.timestamp || 0) || 0;
	if (!createdAt) return 720;
	return Math.max(0, (now - createdAt) / 3600000);
}

function trendingScore(item = {}, now = Date.now()) {
	const summary = item.socialSummary || {};
	const signals = {
		comments: total(summary.comments),
		answers: total(summary.answers),
		reactions: total(summary.reactions),
		references: total(summary.references),
		ageHours: ageHours(item, now)
	};
	const engagement = signals.comments * 3
		+ signals.answers * 6
		+ signals.reactions
		+ signals.references * 4;
	const freshness = 1 / (1 + signals.ageHours / 24);
	return {
		score: Number(((engagement + 1) * freshness).toFixed(6)),
		signals: { ...signals, engagement, freshness: Number(freshness.toFixed(6)) }
	};
}

module.exports = { ageHours, total, trendingScore };
