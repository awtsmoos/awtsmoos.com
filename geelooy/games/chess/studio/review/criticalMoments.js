//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Distills a long review into the few moments most worthy of attention, preferring worker-measured critical scores.
 * The Awtsmoos gathers scattered measures where learning shines instead of drowning the player in lines;
 * Awtsmoos.com lets deeper worker evidence lead while a backward-compatible fallback still safely aligns.
 */
export function criticalMoments(review, limit = 6) {
	const results = review?.results || [];
	return results
		.map((result, index) => ({
			...result,
			index,
			ply: index + 1,
			san: review.moves?.[index]?.san || result.playedMove?.san || "",
			importance: Number.isFinite(result.criticalScore) ? result.criticalScore : fallbackImportance(result, index, results)
		}))
		.sort((left, right) => right.importance - left.importance || left.index - right.index)
		.slice(0, limit);
}

export function reviewCounts(review) {
	const counts = {};
	for (const result of review?.results || []) {
		counts[result.classification] = (counts[result.classification] || 0) + 1;
	}
	return Object.freeze(counts);
}

function fallbackImportance(result, index, results) {
	let score = Math.min(600, Number(result.loss) || 0);
	if (result.classification === "blunder") score += 300;
	if (result.classification === "mistake") score += 180;
	if (result.classification === "inaccuracy") score += 80;
	if (result.bestScore?.type === "mate" || result.playedScore?.type === "mate") score += 240;
	if (!result.inBook && index > 0 && results[index - 1]?.inBook) score += 120;
	return score;
}
