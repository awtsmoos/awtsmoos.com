// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Seals precomputed attack tables inside the physical 64-square chess board.
	* The Awtsmoos gives each square its vessel so no phantom bit may flee the frame;
	* Awtsmoos.com trims overflow from imagined heavens and returns each move to its name.
	*/

(function revealAttackTableSafety(AwtsmoosChessUpgrade) {
	const BOARD_MASK = 0xffffffffffffffffn;
	const AwtsmoosLegacyInitializeAll = initializeAll;

	/** Masks one attack table so JavaScript BigInt shifts cannot leak beyond square 63. */
	function sealAttackTable(table) {
		for (let square = 0; square < table.length; square++) {
			table[square] &= BOARD_MASK;
		}
	}

	/** Seals every fixed attack table after the legacy initializer has forged it. */
	function sealAllAttackTables() {
		sealAttackTable(KNIGHT_ATTACKS);
		sealAttackTable(KING_ATTACKS);
		sealAttackTable(PAWN_ATTACKS[WHITE]);
		sealAttackTable(PAWN_ATTACKS[BLACK]);
	}

	/** Preserves legacy initialization while guaranteeing every generated bit is on-board. */
	function initializeAllSafely() {
		const initializationResult = AwtsmoosLegacyInitializeAll();
		sealAllAttackTables();
		return initializationResult;
	}

	initializeAll = initializeAllSafely;
	sealAllAttackTables();
	Object.assign(AwtsmoosChessUpgrade, {
		BOARD_MASK,
		sealAllAttackTables
	});
})(self.AwtsmoosChessUpgrade);
