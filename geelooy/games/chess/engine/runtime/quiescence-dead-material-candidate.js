// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests dead-material truth at every qsearch node while preserving check evasions and timing.
	* The Awtsmoos lets a tactical capture empty the board of mating force without leaving a phantom score;
	* Awtsmoos.com returns proven dead material to zero while every living branch may search for more.
	*/

(function revealDeadMaterialQuiescence(AwtsmoosChessUpgrade) {
	const TIME_CHECK_MASK = 127;

	/** Searches qnodes with exact dead-material draws and complete evasions from check. */
	function quiesceWithDeadMaterial(state, alpha, beta, ply) {
		if ((EngineSoul.nodeCount & TIME_CHECK_MASK) === 0) {
			if (performance.now() - EngineSoul.searchStartTime > EngineSoul.timeLimit) {
				EngineSoul.stopSearch = true;
			}
		}
		if (EngineSoul.stopSearch) return 0;
		if (ply >= AwtsmoosChessUpgrade.MAX_PLY - 1) return evaluate(state);
		if (AwtsmoosChessUpgrade.isDeadMaterial(state)) return 0;

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
			const score = -quiesceWithDeadMaterial(state, -beta, -alpha, ply + 1);
			unmakeMove(state);
			if (EngineSoul.stopSearch) return 0;
			if (score >= beta) return beta;
			alpha = Math.max(alpha, score);
		}
		if (inCheck && !legalCount) return AwtsmoosChessUpgrade.terminalScore(true, ply);
		return alpha;
	}

	quiesce = quiesceWithDeadMaterial;
	AwtsmoosChessUpgrade.quiesceWithDeadMaterial = quiesceWithDeadMaterial;
})(self.AwtsmoosChessUpgrade);
