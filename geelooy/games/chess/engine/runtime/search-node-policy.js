// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Keeps small node-level search decisions outside the recursive search vessel.
	* The Awtsmoos distinguishes quiet branches from crowns that demand the fullest sight;
	* Awtsmoos.com guards king-law and terminal truth while search pursues the deepest light.
	*/

(function revealSearchNodePolicy(AwtsmoosChessUpgrade) {
	/** Returns true only for a genuinely quiet move that is safe to reduce later. */
	function isReducibleQuietMove(move) {
		return !getMoveCapture(move) && !getMovePromoted(move);
	}

	/** Reports whether the side that just moved left its king absent or attacked. */
	function isIllegalAfterMove(state) {
		const movingSide = state.turn ^ 1;
		const movedKing = getLSBIndex(state.pieceBitboards[movingSide * 6 + K]);
		return movedKing === -1 || isSquareAttacked_lean(state, movedKing, state.turn);
	}

	/** Gives the correct terminal score when no legal moves remain. */
	function terminalScore(inCheck, ply) {
		if (inCheck) {
			return -AwtsmoosChessUpgrade.MATE_SCORE + ply;
		}
		return 0;
	}

	Object.assign(AwtsmoosChessUpgrade, {
		isReducibleQuietMove,
		isIllegalAfterMove,
		terminalScore
	});
})(self.AwtsmoosChessUpgrade);
