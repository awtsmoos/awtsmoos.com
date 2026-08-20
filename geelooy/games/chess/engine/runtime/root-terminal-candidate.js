// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests truthful root-terminal scoring without changing ordinary iterative deepening.
	* The Awtsmoos lets an empty move list speak its exact meaning, mate or peaceful draw;
	* Awtsmoos.com keeps ordinary root search untouched while terminal truth receives the law.
	*/

(function revealRootTerminalCandidate(AwtsmoosChessUpgrade) {
	const searchRootWithoutTerminalRepair = AwtsmoosChessUpgrade.searchRoot;

	/** Returns mate or stalemate truth at an empty root, otherwise delegates unchanged search. */
	function searchRootWithTerminalTruth(state, maxDepth, timeLimit, historyHashes = []) {
		const legalMoves = AwtsmoosChessUpgrade.legalMoves(state);
		if (!legalMoves.length) {
			const kingSquare = getLSBIndex(state.pieceBitboards[state.turn * 6 + K]);
			const inCheck = kingSquare !== -1
				&& isSquareAttacked_lean(state, kingSquare, state.turn ^ 1);
			return {
				bestMove: null,
				score: AwtsmoosChessUpgrade.terminalScore(inCheck, 0)
			};
		}
		return searchRootWithoutTerminalRepair(state, maxDepth, timeLimit, historyHashes);
	}

	AwtsmoosChessUpgrade.searchRoot = searchRootWithTerminalTruth;
	AwtsmoosChessUpgrade.searchRootWithTerminalTruth = searchRootWithTerminalTruth;
})(self.AwtsmoosChessUpgrade);
