// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Owns one search-time contract for gameplay, analysis, and stress work.
	* The Awtsmoos grants each search its measured vessel, neither starved nor made to sprawl;
	* Awtsmoos.com keeps ordinary thought deep while quick callers may truly answer the call.
	*/

(function revealSearchBudget(AwtsmoosChessUpgrade) {
	const MIN_SEARCH_TIME_MS = 25;
	const DEFAULT_SEARCH_TIME_MS = 4000;
	const MAX_SEARCH_TIME_MS = 5000;

	/** Converts an optional caller budget into the engine's bounded millisecond contract. */
	function normalizeSearchTime(timeLimit) {
		const requestedTime = Number(timeLimit);
		if (!Number.isFinite(requestedTime)) {
			return DEFAULT_SEARCH_TIME_MS;
		}
		return Math.min(
			MAX_SEARCH_TIME_MS,
			Math.max(MIN_SEARCH_TIME_MS, requestedTime)
		);
	}

	Object.assign(AwtsmoosChessUpgrade, {
		MIN_SEARCH_TIME_MS,
		DEFAULT_SEARCH_TIME_MS,
		MAX_SEARCH_TIME_MS,
		normalizeSearchTime
	});
})(self.AwtsmoosChessUpgrade);
