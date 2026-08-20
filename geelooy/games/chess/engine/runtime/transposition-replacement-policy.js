// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Protects deeper transposition knowledge from strictly shallower replacement.
	* The Awtsmoos lets every discovered depth retain the measure it has earned;
	* Awtsmoos.com keeps deeper truth in its vessel until equal or deeper light is learned.
	*/

(function revealTranspositionReplacementPolicy(AwtsmoosChessUpgrade) {
	const storeTranspositionUnconditionally = AwtsmoosChessUpgrade.storeTransposition;

	/** Stores a TT entry unless it would discard strictly deeper knowledge at this hash. */
	function storeTranspositionByDepth(hash, score, depth, flag, move, ply) {
		const existingEntry = EngineSoul.transpositionTable.get(hash);
		if (existingEntry && existingEntry.depth > depth) {
			return false;
		}
		storeTranspositionUnconditionally(hash, score, depth, flag, move, ply);
		return true;
	}

	AwtsmoosChessUpgrade.storeTransposition = storeTranspositionByDepth;
	AwtsmoosChessUpgrade.storeTranspositionByDepth = storeTranspositionByDepth;
})(self.AwtsmoosChessUpgrade);
