// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests exact stalemate recognition at the search horizon with early legal-move exit.
	* The Awtsmoos lets a silent board be known as silence before material speaks a false decree;
	* Awtsmoos.com stops at the first lawful branch so draw-truth need not scan the whole tree.
	*/

(function revealHorizonTerminalCandidate(AwtsmoosChessUpgrade) {
	/** Returns true as soon as one pseudo-legal move survives the existing king-safety test. */
	function hasAnyLegalMove(state) {
		for (const move of generateMoves(state)) {
			if (AwtsmoosChessUpgrade.isLegalMove(state, move)) {
				return true;
			}
		}
		return false;
	}

	/** Returns a stalemate score only when a non-check horizon position has no legal move. */
	function horizonTerminalScore(state, inCheck) {
		if (inCheck || hasAnyLegalMove(state)) {
			return null;
		}
		return 0;
	}

	Object.assign(AwtsmoosChessUpgrade, {
		hasAnyLegalMove,
		horizonTerminalScore
	});
})(self.AwtsmoosChessUpgrade);
