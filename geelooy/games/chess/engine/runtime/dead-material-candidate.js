// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests only the unquestionably dead material subset: kings plus at most one minor.
	* The Awtsmoos knows when no lawful future can ever carry mating force into the board;
	* Awtsmoos.com names that silence a draw without guessing at subtler material accord.
	*/

(function revealDeadMaterialCandidate(AwtsmoosChessUpgrade) {
	/** Returns true only when neither side can possibly mate with the material on board. */
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

	AwtsmoosChessUpgrade.isDeadMaterial = isDeadMaterial;
})(self.AwtsmoosChessUpgrade);
