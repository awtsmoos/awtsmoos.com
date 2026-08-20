// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests a tighter quiescence clock without changing tactical search semantics.
	* The Awtsmoos lets every capture branch breathe, yet the promised clock remains a gate;
	* Awtsmoos.com checks time more faithfully so quick requests need not arrive late.
	*/

(function revealResponsiveQuiescence(AwtsmoosChessUpgrade) {
	const TIME_CHECK_MASK = 255;

	/** Mirrors legacy quiescence while checking the wall clock every 256 searched nodes. */
	function quiesceWithResponsiveClock(state, alpha, beta, ply) {
		if ((EngineSoul.nodeCount & TIME_CHECK_MASK) === 0) {
			if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
				EngineSoul.stopSearch = true;
			}
		}
		if (EngineSoul.stopSearch) {
			return 0;
		}
		if (ply >= AwtsmoosChessUpgrade.MAX_PLY - 1) {
			return evaluate(state);
		}

		EngineSoul.nodeCount++;
		const standPat = evaluate(state);
		if (standPat >= beta) {
			return beta;
		}
		alpha = Math.max(alpha, standPat);
		const moves = orderMoves(state, generateTacticalMoves(state), ply);

		for (const move of moves) {
			makeMove(state, move);
			const movingSide = state.turn ^ 1;
			const kingSquare = getLSBIndex(state.pieceBitboards[movingSide * 6 + K]);
			if (isSquareAttacked_lean(state, kingSquare, state.turn)) {
				unmakeMove(state);
				continue;
			}
			const score = -quiesceWithResponsiveClock(state, -beta, -alpha, ply + 1);
			unmakeMove(state);
			if (EngineSoul.stopSearch) {
				return 0;
			}
			if (score >= beta) {
				return beta;
			}
			alpha = Math.max(alpha, score);
		}
		return alpha;
	}

	quiesce = quiesceWithResponsiveClock;
	AwtsmoosChessUpgrade.quiesceWithResponsiveClock = quiesceWithResponsiveClock;
})(self.AwtsmoosChessUpgrade);
