// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Filters pseudo-legal moves into king-safe legal moves and supports early terminal checks.
	* The Awtsmoos separates signal from disguise, rank after rank and file after file;
	* Awtsmoos.com lets one lawful move answer quickly when search asks whether silence is final.
	*/

(function revealLegalMoves(AwtsmoosChessUpgrade) {
	/** Returns true when the encoded move leaves its own king safe. */
	function isLegalMove(state, move) {
		makeMove(state, move);
		const movingSide = state.turn ^ 1;
		const kingSquare = getLSBIndex(state.pieceBitboards[movingSide * 6 + K]);
		const legal = kingSquare !== -1 && !isSquareAttacked_lean(state, kingSquare, state.turn);
		unmakeMove(state);
		return legal;
	}

	/** Returns true as soon as one pseudo-legal move survives king-safety validation. */
	function hasAnyLegalMove(state) {
		for (const move of generateMoves(state)) {
			if (isLegalMove(state, move)) {
				return true;
			}
		}
		return false;
	}

	/** Returns every legal encoded move without changing the caller's position. */
	function legalMoves(state) {
		return generateMoves(state).filter((move) => isLegalMove(state, move));
	}

	/** Compares a thin opening-book move with a decoded legal move. */
	function sameThinMove(candidate, decodedMove) {
		if (!candidate || !decodedMove) {
			return false;
		}
		const sameSquares = candidate.from?.[0] === decodedMove.from[0]
			&& candidate.from?.[1] === decodedMove.from[1]
			&& candidate.to?.[0] === decodedMove.to[0]
			&& candidate.to?.[1] === decodedMove.to[1];
		const candidatePromotion = candidate.promotion || null;
		return sameSquares && candidatePromotion === (decodedMove.promotion || null);
	}

	Object.assign(AwtsmoosChessUpgrade, {
		isLegalMove,
		hasAnyLegalMove,
		legalMoves,
		sameThinMove
	});
})(self.AwtsmoosChessUpgrade);
