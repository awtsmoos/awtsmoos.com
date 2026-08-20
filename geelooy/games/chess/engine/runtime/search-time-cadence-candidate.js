// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests a closer main-search clock cadence without touching production search support.
	* The Awtsmoos lets each quiet branch remember the promised moment while tactics keep their light;
	* Awtsmoos.com measures whether more frequent listening helps before changing the living search's sight.
	*/

(function revealMainSearchTimeCandidate(AwtsmoosChessUpgrade) {
	const TIME_CHECK_MASK = 255;

	/** Checks the main-search wall clock every 256 counted nodes. */
	function checkTimeCloser() {
		if ((EngineSoul.nodeCount & TIME_CHECK_MASK) !== 0) {
			return EngineSoul.stopSearch;
		}
		if (performance.now() - EngineSoul.searchStartTime >= EngineSoul.timeLimit) {
			EngineSoul.stopSearch = true;
		}
		return EngineSoul.stopSearch;
	}

	AwtsmoosChessUpgrade.checkTime = checkTimeCloser;
	AwtsmoosChessUpgrade.checkTimeCloser = checkTimeCloser;
})(self.AwtsmoosChessUpgrade);
