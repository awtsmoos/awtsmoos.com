// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests per-search static-evaluation reuse without changing evaluation semantics.
	* The Awtsmoos lets one position return through many branches while its measured truth remains one;
	* Awtsmoos.com remembers that score for the search, then clears the vessel when the search is done.
	*/

(function revealEvaluationCacheCandidate(AwtsmoosChessUpgrade) {
	const evaluateWithoutCache = evaluate;
	const evaluationCache = new Map();

	/** Clears all cached static evaluations before an independent search begins. */
	function resetEvaluationCache() {
		evaluationCache.clear();
	}

	/** Returns the exact legacy evaluation while reusing prior work for the same Zobrist position. */
	function evaluateWithCache(state) {
		const hash = state.zobristHash;
		if (evaluationCache.has(hash)) {
			return evaluationCache.get(hash);
		}
		const score = evaluateWithoutCache(state);
		evaluationCache.set(hash, score);
		return score;
	}

	evaluate = evaluateWithCache;
	Object.assign(AwtsmoosChessUpgrade, {
		evaluationCache,
		resetEvaluationCache,
		evaluateWithCache
	});
})(self.AwtsmoosChessUpgrade);
