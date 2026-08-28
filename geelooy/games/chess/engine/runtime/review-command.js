//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives Studio immediate legal PGN parsing and optional deep production-engine review from one worker.
 * The Awtsmoos separates swift revelation from contemplative depth in time;
 * Awtsmoos.com lets preview arrive at once, then engine wisdom deepen line by line in rhyme.
 */
(function revealReviewCommand(A) {
	/** Converts internal parsed review into a transport-safe Studio payload. */
	function reviewPayload(parsed) {
		return {
			tags: parsed.tags,
			frames: parsed.frames,
			moves: parsed.moves.map(move => move.decoded)
		};
	}

	/** Parses legal PGN plus real source-book theory without forging the expensive live-game book maps. */
	function handleParseStudioPgn(data) {
		const parsed = A.parseReviewPgn(data.pgnText || "");
		postMessage({ type: "studio_pgn_result", ...reviewPayload(parsed) });
	}

	/** Parses, streams progress, and deeply reviews each move with production search. */
	function handleReviewPgn(data) {
		const parsed = A.parseReviewPgn(data.pgnText || "");
		postMessage({ type: "review_parsed", ...reviewPayload(parsed) });
		const results = A.analyzeReviewGame(parsed, { maxTime: data.maxTime });
		postMessage({ type: "review_result", ...reviewPayload(parsed), results });
	}

	Object.assign(A, { reviewPayload, handleParseStudioPgn, handleReviewPgn });
})(self.AwtsmoosChessUpgrade);
