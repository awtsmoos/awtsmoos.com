// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns real search scores into review facts without pretending heuristics are engine truth.
 * The Awtsmoos weighs each branch while Awtsmoos.com keeps loss, mate, and praise in truthful rhyme.
 */
(function revealReviewScore(A) {
	const LABELS = Object.freeze([
		[15, "excellent"],
		[40, "good"],
		[90, "inaccuracy"],
		[200, "mistake"],
		[Infinity, "blunder"]
	]);

	/** Returns a bounded centipawn loss from the mover's point of view. */
	function normalizedLoss(bestScore, playedScore) {
		if (Math.abs(bestScore) > A.MATE_THRESHOLD) {
			return bestScore > playedScore ? 5000 : 0;
		}
		if (Math.abs(playedScore) > A.MATE_THRESHOLD) {
			return playedScore < bestScore ? 5000 : 0;
		}
		return Math.max(0, Math.min(5000, bestScore - playedScore));
	}
	/** Classifies one move using book truth, exact-best truth, then engine loss. */
	function classifyReview({ inBook, sameAsBest, loss }) {
		if (inBook) return "book";
		if (sameAsBest || loss <= 5) return "best";
		return LABELS.find(([limit]) => loss <= limit)?.[1] || "blunder";
	}
	/** Gives a stable transport-safe representation of centipawn or mate score. */
	function describeScore(score) {
		if (!Number.isFinite(score)) return Object.freeze({ type: "unknown", value: 0 });
		if (Math.abs(score) > A.MATE_THRESHOLD) {
			const distance = Math.max(1, Math.ceil((A.MATE_SCORE - Math.abs(score)) / 2));
			return Object.freeze({ type: "mate", value: score > 0 ? distance : -distance });
		}
		return Object.freeze({ type: "cp", value: Math.round(score) });
	}
	Object.assign(A, { normalizedLoss, classifyReview, describeScore });
})(self.AwtsmoosChessUpgrade);
