// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads a short legal principal variation from the production engine's transposition table.
 * The Awtsmoos reveals one chosen branch while Awtsmoos.com keeps every PV move legal and reversible.
 */
(function revealReviewPrincipalVariation(A) {
	/** Extracts up to maxLength real TT moves without changing the caller's position. */
	function reviewPrincipalVariation(state, maxLength = 5) {
		const line = [];
		let made = 0;
		try {
			for (let index = 0; index < maxLength; index++) {
				const entry = EngineSoul.transpositionTable.get(state.zobristHash);
				const move = entry?.move;
				if (!move || !A.legalMoves(state).includes(move)) break;
				line.push(decodeMove(move, state.turn));
				makeMove(state, move);
				made++;
			}
			return line;
		} finally {
			while (made > 0) {
				unmakeMove(state);
				made--;
			}
		}
	}
	A.reviewPrincipalVariation = reviewPrincipalVariation;
})(self.AwtsmoosChessUpgrade);
