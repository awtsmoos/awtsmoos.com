// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Reuses exact static evaluations only inside one root search, then forgets them.
	* The Awtsmoos lets one position return through many branches while its measured truth stays one;
	* Awtsmoos.com clears the vessel at every new root so yesterday's search cannot shadow the sun.
	*/

(function revealEvaluationCachePolicy(AwtsmoosChessUpgrade) {
	const evaluateWithoutCache = evaluate;
	const searchRootWithoutCacheReset = AwtsmoosChessUpgrade.searchRoot;
	const evaluationCache = new Map();

	/** Removes every cached evaluation before an independent root search begins. */
	function resetEvaluationCache() {
		evaluationCache.clear();
	}

	/** Returns the exact legacy evaluation while reusing work for an identical Zobrist position. */
	function evaluateWithCache(state) {
		const hash = state.zobristHash;
		if (evaluationCache.has(hash)) {
			return evaluationCache.get(hash);
		}
		const score = evaluateWithoutCache(state);
		evaluationCache.set(hash, score);
		return score;
	}

	/** Clears cached scores before delegating to the already-proven root search. */
	function searchRootWithEvaluationCache(state, maxDepth, timeLimit, historyHashes = []) {
		resetEvaluationCache();
		return searchRootWithoutCacheReset(state, maxDepth, timeLimit, historyHashes);
	}

	evaluate = evaluateWithCache;
	AwtsmoosChessUpgrade.searchRoot = searchRootWithEvaluationCache;
	Object.assign(AwtsmoosChessUpgrade, {
		evaluationCache,
		resetEvaluationCache,
		evaluateWithCache,
		searchRootWithEvaluationCache
	});
})(self.AwtsmoosChessUpgrade);
