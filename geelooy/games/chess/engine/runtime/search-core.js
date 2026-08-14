// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Principal-variation search whose reductions protect forcing promotions.
	* The Awtsmoos lets quiet branches narrow while crowns still blaze in full array;
	* Awtsmoos.com preserves mate-distance truth and keeps each forcing ray in play.
	*/

(function revealRepairedSearch(A) {
	/** Searches one negamax node while preserving repetition, timing, and TT truth. */
	function search(state, depth, alpha, beta, ply) {
		if (ply >= A.MAX_PLY - 1) {
			return evaluate(state);
		}
		if (A.checkTime()) {
			return 0;
		}
		const isRoot = ply === 0;
		const hash = state.zobristHash;
		if (!isRoot && A.isThreefold(hash)) {
			return 0;
		}
		if (!isRoot) {
			const probe = A.probeTransposition(hash, depth, alpha, beta, ply);
			alpha = probe.alpha;
			beta = probe.beta;
			if (probe.hit) {
				return probe.score;
			}
		}

		const kingSquare = getLSBIndex(state.pieceBitboards[state.turn * 6 + K]);
		const inCheck = kingSquare !== -1 && isSquareAttacked_lean(state, kingSquare, state.turn ^ 1);
		const extension = inCheck ? 1 : 0;
		if (depth + extension <= 0) {
			const staticScore = evaluate(state);
			const hasNoMoves = !inCheck && Math.abs(staticScore) > 500 && A.legalMoves(state).length === 0;
			if (hasNoMoves) {
				return 0;
			}
			return quiesce(state, alpha, beta, ply);
		}

		if (!isRoot && depth >= 3 && !inCheck && ply > 0) {
			const nonPawnMaterial = state.occupancies[state.turn]
				^ state.pieceBitboards[state.turn * 6 + K]
				^ state.pieceBitboards[state.turn * 6 + P];
			if (nonPawnMaterial !== 0n) {
				const nullScore = A.searchNullMove(state, depth, beta, ply);
				if (EngineSoul.stopSearch) {
					return 0;
				}
				if (nullScore >= beta) {
					return beta;
				}
			}
		}

		EngineSoul.nodeCount++;
		const moves = orderMoves(state, generateMoves(state), ply);
		let legalCount = 0;
		let bestScore = -Infinity;
		let bestMove = 0;
		let ttFlag = A.TT_UPPER;
		for (const move of moves) {
			EngineSoul.repetitionHistory.push(hash);
			makeMove(state, move);
			if (A.isIllegalAfterMove(state)) {
				unmakeMove(state);
				EngineSoul.repetitionHistory.pop();
				continue;
			}

			legalCount++;
			const quietMove = A.isReducibleQuietMove(move);
			let score;
			if (legalCount === 1) {
				score = -search(state, depth - 1 + extension, -beta, -alpha, ply + 1);
			} else {
				const reduction = depth >= 3 && legalCount > 4 && quietMove && !inCheck ? 1 : 0;
				score = -search(state, depth - 1 - reduction + extension, -alpha - 1, -alpha, ply + 1);
				if (score > alpha && reduction) {
					score = -search(state, depth - 1 + extension, -alpha - 1, -alpha, ply + 1);
				}
				if (score > alpha && score < beta) {
					score = -search(state, depth - 1 + extension, -beta, -alpha, ply + 1);
				}
			}
			unmakeMove(state);
			EngineSoul.repetitionHistory.pop();
			if (EngineSoul.stopSearch) {
				return 0;
			}
			if (score > bestScore) {
				bestScore = score;
				bestMove = move;
			}
			if (bestScore > alpha) {
				alpha = bestScore;
				ttFlag = A.TT_EXACT;
			}
			if (alpha >= beta) {
				if (quietMove) {
					A.rememberQuietCutoff(state, move, depth, ply);
				}
				A.storeTransposition(hash, beta, depth, A.TT_LOWER, move, ply);
				return beta;
			}
		}
		if (!legalCount) {
			return A.terminalScore(inCheck, ply);
		}
		A.storeTransposition(hash, bestScore, depth, ttFlag, bestMove, ply);
		return bestScore;
	}

	A.search = search;
})(self.AwtsmoosChessUpgrade);
