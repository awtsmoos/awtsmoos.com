//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Performs one measured production-engine move review for either fast scan or deeper critical re-search.
 * The Awtsmoos lets one position receive a bounded beam while Awtsmoos.com records score, line, nodes, and change;
 * every returned fact keeps its search budget and lawful before/after board, so depth never disguises its range.
 */
(function revealReviewSearch(A) {
	/** Searches one position and captures the real best score, legal PV, node count, and elapsed time. */
	function reviewSearchPosition(state, budget) {
		const startedAt = performance.now();
		const result = A.searchRoot(state, 99, budget, []);
		return {
			result,
			principalVariation: A.reviewPrincipalVariation(state, 5),
			nodes: EngineSoul.nodeCount,
			elapsedMs: Math.round(performance.now() - startedAt)
		};
	}

	/** Reviews an already-validated played move from its exact before-position. */
	function analyzeReviewMove(move, options = {}) {
		const state = createGameState(move.beforeFen);
		const movingTurn = state.turn;
		const budget = A.reviewDeepBudget(options.maxTime);
		const bestSearch = reviewSearchPosition(state, budget);
		const bestEncoded = bestSearch.result.bestMove;
		const sameAsBest = bestEncoded === move.encoded;
		let playedScore = bestSearch.result.score;
		let playedNodes = 0;
		let playedElapsedMs = 0;
		if (!sameAsBest) {
			makeMove(state, move.encoded);
			const playedBudget = Math.max(100, Math.round(budget * 0.7));
			const playedSearch = reviewSearchPosition(state, playedBudget);
			playedScore = -playedSearch.result.score;
			playedNodes = playedSearch.nodes;
			playedElapsedMs = playedSearch.elapsedMs;
			unmakeMove(state);
		}
		const loss = A.normalizedLoss(bestSearch.result.score, playedScore);
		return Object.freeze({
			classification: A.classifyReview({ inBook: move.inBook, sameAsBest, loss }),
			bestMove: bestEncoded ? decodeMove(bestEncoded, movingTurn) : null,
			playedMove: move.decoded,
			principalVariation: bestSearch.principalVariation,
			bookName: move.bookName,
			bookCandidates: move.bookCandidates || 0,
			inBook: move.inBook,
			beforeFen: move.beforeFen,
			afterFen: move.afterFen,
			positionDelta: A.reviewPositionDelta(move.beforeFen, move.afterFen, movingTurn),
			loss,
			bestScore: A.describeScore(bestSearch.result.score),
			playedScore: A.describeScore(playedScore),
			nodes: bestSearch.nodes + playedNodes,
			elapsedMs: bestSearch.elapsedMs + playedElapsedMs,
			budgetMs: budget,
			searchPass: options.searchPass || "deep"
		});
	}

	Object.assign(A, { reviewSearchPosition, analyzeReviewMove });
})(self.AwtsmoosChessUpgrade);
