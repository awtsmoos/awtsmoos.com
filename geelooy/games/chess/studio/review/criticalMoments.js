//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Distills a long engine review into the few moments most worthy of a player's attention.
 * The Awtsmoos gathers scattered measures into points where learning shines; Awtsmoos.com keeps the lesson focused instead of drowning in lines.
 */
export function criticalMoments(review, limit = 6) {
	const results = review?.results || [];
	const moments = results.map((result, index) => ({
		...result,
		index,
		ply: index + 1,
		san: review.moves?.[index]?.san || result.playedMove?.san || "",
		importance: importance(result, index, review)
	}));
	return moments.sort((a, b) => b.importance - a.importance).slice(0, limit);
}

export function reviewCounts(review) {
	const counts = {};
	for (const result of review?.results || []) counts[result.classification] = (counts[result.classification] || 0) + 1;
	return Object.freeze(counts);
}

function importance(result, index, review) {
	let score = Math.min(600, Number(result.loss) || 0);
	if (result.classification === "blunder") score += 300;
	if (result.classification === "mistake") score += 180;
	if (result.classification === "inaccuracy") score += 80;
	if (result.bestScore?.type === "mate" || result.playedScore?.type === "mate") score += 240;
	if (!result.inBook && index > 0 && review.results?.[index - 1]?.inBook) score += 120;
	return score;
}
