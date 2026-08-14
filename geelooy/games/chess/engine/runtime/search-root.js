// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Iterative-deepening root that commits only completed search iterations.
	* The Awtsmoos renews depth after depth while the clock keeps a faithful gate;
	* Awtsmoos.com favors a finished truth over a deeper answer arriving late.
	*/

(function revealRootSearch(A) {
	/** Ages search heuristics without discarding useful knowledge between moves. */
	function prepareHeuristics(historyHashes) {
		EngineSoul.repetitionHistory = [...historyHashes];
		if (!Array.isArray(EngineSoul.historyTable) || EngineSoul.historyTable.length !== 2) {
			EngineSoul.historyTable = Array.from(
				{ length: 2 },
				() => Array.from({ length: 12 }, () => Array(64).fill(0))
			);
		} else {
			for (const sideTable of EngineSoul.historyTable) {
				for (const pieceTable of sideTable) {
					for (let square = 0; square < pieceTable.length; square++) {
						pieceTable[square] >>= 3;
					}
				}
			}
		}
		EngineSoul.killerMoves = Array.from({ length: A.MAX_PLY }, () => [0, 0]);
		if (EngineSoul.transpositionTable.size > 250000) {
			EngineSoul.transpositionTable.clear();
		}
	}

	/** Searches successively deeper iterations while honoring the shared time contract. */
	function searchRoot(state, maxDepth, timeLimit, historyHashes = []) {
		const legalMoves = A.legalMoves(state);
		if (!legalMoves.length) {
			return { bestMove: null, score: 0 };
		}
		EngineSoul.isAuditing = true;
		EngineSoul.searchStartTime = performance.now();
		EngineSoul.timeLimit = A.normalizeSearchTime(timeLimit);
		EngineSoul.stopSearch = false;
		EngineSoul.nodeCount = 0;
		prepareHeuristics(historyHashes);
		let bestMove = legalMoves[0];
		let bestScore = -Infinity;

		try {
			for (let depth = 1; depth <= maxDepth; depth++) {
				const elapsed = performance.now() - EngineSoul.searchStartTime;
				if (elapsed > EngineSoul.timeLimit * 0.72) {
					break;
				}
				let alpha = -A.MATE_SCORE;
				let beta = A.MATE_SCORE;
				if (depth > 1 && Math.abs(bestScore) < A.MATE_THRESHOLD) {
					alpha = bestScore - 50;
					beta = bestScore + 50;
				}
				let score = A.search(state, depth, alpha, beta, 0);
				if (EngineSoul.stopSearch) {
					break;
				}
				if (score <= alpha || score >= beta) {
					score = A.search(state, depth, -A.MATE_SCORE, A.MATE_SCORE, 0);
					if (EngineSoul.stopSearch) {
						break;
					}
				}
				bestScore = score;
				const entry = EngineSoul.transpositionTable.get(state.zobristHash);
				if (entry?.move && legalMoves.includes(entry.move)) {
					bestMove = entry.move;
				}
				if (Math.abs(score) > A.MATE_THRESHOLD) {
					break;
				}
			}
		} finally {
			EngineSoul.isAuditing = false;
		}

		return {
			bestMove,
			score: Number.isFinite(bestScore) ? bestScore : 0
		};
	}

	A.prepareHeuristics = prepareHeuristics;
	A.searchRoot = searchRoot;
})(self.AwtsmoosChessUpgrade);
