// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Keeps small node-level search decisions outside the recursive search vessel.
	* The Awtsmoos distinguishes quiet branches, king-law, and boards where mating force is gone;
	* Awtsmoos.com names only proven silence a draw while search continues toward dawn.
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

	/** Recognizes only kings plus at most one minor as unquestionably dead material. */
	function isDeadMaterial(state) {
		const pawns = state.pieceBitboards[P] | state.pieceBitboards[P + 6];
		const rooks = state.pieceBitboards[R] | state.pieceBitboards[R + 6];
		const queens = state.pieceBitboards[Q] | state.pieceBitboards[Q + 6];
		if ((pawns | rooks | queens) !== 0n) {
			return false;
		}
		const minors = state.pieceBitboards[N]
			| state.pieceBitboards[B]
			| state.pieceBitboards[N + 6]
			| state.pieceBitboards[B + 6];
		return popcount(minors) <= 1;
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
		isDeadMaterial,
		terminalScore
	});
})(self.AwtsmoosChessUpgrade);
