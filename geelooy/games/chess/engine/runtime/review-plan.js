//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Plans fast-scan and deep-search budgets, then ranks only measured critical moments for expensive review.
 * The Awtsmoos gives quiet plies a smaller vessel while decisive errors receive a deeper beam;
 * Awtsmoos.com spends search time where engine loss and lawful position change show the greatest need to dream.
 */
(function revealReviewPlan(A) {
	const CLASS_WEIGHT = Object.freeze({ book: 0, best: 0, excellent: 5, good: 12, inaccuracy: 45, mistake: 100, blunder: 180 });

	/** Normalizes the user's requested deep-review budget. */
	function reviewDeepBudget(value) {
		return Math.max(100, Math.min(2500, Number(value) || 650));
	}

	/** Keeps the whole-game scan responsive even when deep strength is high. */
	function reviewScanBudget(value) {
		const deep = reviewDeepBudget(value);
		return Math.max(100, Math.min(180, Math.round(deep * 0.38)));
	}

	/** Ranks one result from engine loss, first book deviation, and deterministic position deltas. */
	function reviewCriticalScore(result, index, results = []) {
		if (!result) return 0;
		let score = CLASS_WEIGHT[result.classification] || 0;
		score += Math.min(180, Math.round((Number(result.loss) || 0) * 0.45));
		if (!result.inBook && index > 0 && results[index - 1]?.inBook) score += 90;
		const delta = result.positionDelta?.delta || {};
		if (delta.kingShelterPawns < 0) score += Math.abs(delta.kingShelterPawns) * 30;
		if (delta.materialBalance < 0) score += Math.abs(delta.materialBalance) * 24;
		if (delta.centerBalance < 0) score += Math.abs(delta.centerBalance) * 10;
		if (result.bestScore?.type === "mate" || result.playedScore?.type === "mate") score += 100;
		return Math.min(500, Math.round(score));
	}

	/** Chooses a bounded subset for full-budget re-search. */
	function reviewDeepCandidates(results) {
		const desired = Math.min(8, Math.max(2, Math.ceil(results.length * 0.22)));
		return results
			.map((result, index) => ({ index, score: reviewCriticalScore(result, index, results) }))
			.filter(item => item.score >= 35)
			.sort((left, right) => right.score - left.score || left.index - right.index)
			.slice(0, desired)
			.map(item => item.index)
			.sort((left, right) => left - right);
	}

	Object.assign(A, { reviewDeepBudget, reviewScanBudget, reviewCriticalScore, reviewDeepCandidates });
})(self.AwtsmoosChessUpgrade);
