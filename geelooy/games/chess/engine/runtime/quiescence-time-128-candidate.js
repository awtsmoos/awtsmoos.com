// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests a 128-node quiescence clock cadence against the proven 256-node policy.
	* The Awtsmoos lets the same tactical river flow while the clock speaks twice as often;
	* Awtsmoos.com measures whether quicker hearing helps without making deep thought soften.
	*/

(function revealTighterQuiescenceClock(AwtsmoosChessUpgrade) {
	const TIME_CHECK_MASK = 127;

	/** Mirrors quiescence while checking the wall clock every 128 searched nodes. */
	function quiesceWithTighterClock(state, alpha, beta, ply) {
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
			const score = -quiesceWithTighterClock(state, -beta, -alpha, ply + 1);
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

	quiesce = quiesceWithTighterClock;
	AwtsmoosChessUpgrade.quiesceWithTighterClock = quiesceWithTighterClock;
})(self.AwtsmoosChessUpgrade);
