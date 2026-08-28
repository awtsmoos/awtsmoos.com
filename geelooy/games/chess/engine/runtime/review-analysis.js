// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reviews played moves with production search and returns score, PV, loss, nodes, and book facts.
 * The Awtsmoos searches depth after depth while Awtsmoos.com turns measurable difference into teachable light.
 */
(function revealReviewAnalysis(A) {
	const DEFAULT_BUDGET = 650;

	/** Searches a position and captures score, legal PV, nodes, and elapsed time. */
	function reviewSearch(state, budget) {
		const startedAt = performance.now();
		const result = A.searchRoot(state, 99, budget, []);
		const principalVariation = A.reviewPrincipalVariation(state, 5);
		return {
			result,
			principalVariation,
			nodes: EngineSoul.nodeCount,
			elapsedMs: Math.round(performance.now() - startedAt)
		};
	}
	/** Reviews one already-validated played move from its exact before-position. */
	function analyzeReviewMove(move, options = {}) {
		const state = createGameState(move.beforeFen);
		const movingTurn = state.turn;
		const budget = Math.max(100, Math.min(2500, Number(options.maxTime) || DEFAULT_BUDGET));
		const bestSearch = reviewSearch(state, budget);
		const bestEncoded = bestSearch.result.bestMove;
		const sameAsBest = bestEncoded === move.encoded;
		let playedScore = bestSearch.result.score;
		let playedNodes = 0;
		let playedElapsedMs = 0;
		if (!sameAsBest) {
			makeMove(state, move.encoded);
			const playedSearch = reviewSearch(state, Math.max(100, Math.round(budget * 0.7)));
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
			inBook: move.inBook,
			loss,
			bestScore: A.describeScore(bestSearch.result.score),
			playedScore: A.describeScore(playedScore),
			nodes: bestSearch.nodes + playedNodes,
			elapsedMs: bestSearch.elapsedMs + playedElapsedMs
		});
	}
	/** Reviews every move sequentially while streaming deterministic progress. */
	function analyzeReviewGame(parsed, options = {}) {
		const results = [];
		for (let index = 0; index < parsed.moves.length; index++) {
			const result = analyzeReviewMove(parsed.moves[index], options);
			results.push(result);
			postMessage({ type: "review_progress", index, total: parsed.moves.length, result });
		}
		return results;
	}
	Object.assign(A, { analyzeReviewMove, analyzeReviewGame });
})(self.AwtsmoosChessUpgrade);
