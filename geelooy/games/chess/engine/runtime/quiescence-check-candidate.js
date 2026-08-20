// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests check-aware quiescence while preserving the proven 128-node clock cadence.
	* The Awtsmoos forbids a checked king from standing still beneath a false evaluation sky;
	* Awtsmoos.com requires every lawful evasion, and names true mate when no escape may fly.
	*/

(function revealCheckAwareQuiescence(AwtsmoosChessUpgrade) {
	const TIME_CHECK_MASK = 127;

	/** Searches noisy positions while requiring complete legal evasions whenever side-to-move is checked. */
	function quiesceWithCheckEvasions(state, alpha, beta, ply) {
		if ((EngineSoul.nodeCount & TIME_CHECK_MASK) === 0) {
			if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
				EngineSoul.stopSearch = true;
			}
		}
		if (EngineSoul.stopSearch) return 0;
		if (ply >= AwtsmoosChessUpgrade.MAX_PLY - 1) return evaluate(state);

		EngineSoul.nodeCount++;
		const kingSquare = getLSBIndex(state.pieceBitboards[state.turn * 6 + K]);
		const inCheck = kingSquare !== -1
			&& isSquareAttacked_lean(state, kingSquare, state.turn ^ 1);
		if (!inCheck) {
			const standPat = evaluate(state);
			if (standPat >= beta) return beta;
			alpha = Math.max(alpha, standPat);
		}

		const generatedMoves = inCheck ? generateMoves(state) : generateTacticalMoves(state);
		const moves = orderMoves(state, generatedMoves, ply);
		let legalCount = 0;
		for (const move of moves) {
			makeMove(state, move);
			if (AwtsmoosChessUpgrade.isIllegalAfterMove(state)) {
				unmakeMove(state);
				continue;
			}
			legalCount++;
			const score = -quiesceWithCheckEvasions(state, -beta, -alpha, ply + 1);
			unmakeMove(state);
			if (EngineSoul.stopSearch) return 0;
			if (score >= beta) return beta;
			alpha = Math.max(alpha, score);
		}
		if (inCheck && !legalCount) {
			return AwtsmoosChessUpgrade.terminalScore(true, ply);
		}
		return alpha;
	}

	quiesce = quiesceWithCheckEvasions;
	AwtsmoosChessUpgrade.quiesceWithCheckEvasions = quiesceWithCheckEvasions;
})(self.AwtsmoosChessUpgrade);
