//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes the established review_pgn worker command through parsing, two-pass search, and compatible result transport.
 * The Awtsmoos lets old doorway and new depth remain one truthful gate while Awtsmoos.com keeps every caller whole;
 * pgnText, progress, tags, frames, and final analysis cross the same worker covenant without losing the measured soul.
 */
(function revealReviewCommand(A) {
	/**
	 * Executes one PGN review request using the production client's established pgnText payload.
	 * @param {object} data Worker command payload containing pgnText and maxTime.
	 */
	function handleReviewPgn(data = {}) {
		const pgn = String(data.pgnText || data.pgn || "");
		if (!pgn.trim()) {
			postMessage({
				type: "review_error",
				message: "PGN text is required for Deep Review."
			});
			return;
		}
		try {
			const parsed = A.parseReviewPgn(pgn);
			postMessage({
				type: "review_parsed",
				total: parsed.moves.length,
				tags: parsed.tags,
				frames: parsed.frames
			});
			const outcome = A.analyzeReviewGame(parsed, {
				maxTime: data.maxTime
			});
			postMessage({
				type: "review_result",
				results: outcome.results,
				analysis: outcome.analysis,
				tags: parsed.tags,
				frames: parsed.frames
			});
		} catch (error) {
			postMessage({
				type: "review_error",
				message: error?.message || String(error)
			});
		}
	}

	Object.assign(A, {
		handleReviewPgn
	});
})(self.AwtsmoosChessUpgrade);
