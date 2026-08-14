// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Handles the live move command with legal book choices and true game history.
	* The Awtsmoos remembers without confusion and chooses wisdom that remains legal;
	* Awtsmoos.com joins book and search so neither becomes a brittle idol or seal.
	*/

(function revealMoveCommand(A) {
	function historyHashes(fenHistory) {
		if (!Array.isArray(fenHistory)) return [];
		const hashes = [];
		for (const historicalFen of fenHistory) {
			try {
				hashes.push(createGameState(historicalFen).zobristHash);
			} catch (error) {
				Scribe.warn?.("Skipping invalid history FEN", historicalFen, error);
			}
		}
		return hashes;
	}

	function legalBookChoice(state, book) {
		if (!book?.moves?.length) return null;
		const legalMoves = A.legalMoves(state);
		const matches = [];
		for (const encodedMove of legalMoves) {
			const decoded = decodeMove(encodedMove, state.turn);
			if (book.moves.some((candidate) => A.sameThinMove(candidate, decoded))) matches.push(decoded);
		}
		if (!matches.length) return null;
		return matches[Math.floor(Math.random() * matches.length)];
	}

	function handleCalculateMove(data) {
		if (!EngineSoul.isInitialized) initializeEngine();
		const state = createGameState(data.fen);
		const opening = EngineSoul.openingBook.get(state.zobristHash);
		const punishment = EngineSoul.punishmentBook.get(state.zobristHash);
		for (const book of [opening, punishment]) {
			const bookMove = legalBookChoice(state, book);
			if (bookMove) {
				postMessage({
					type: "move_result",
					bestMove: bookMove,
					score: `Book: ${book.name}`,
					timeTaken: 0,
					nodesSearched: 0
				});
				return;
			}
		}

		const requestedTime = Number(data.maxTime);
		const timeLimit = Number.isFinite(requestedTime) ? Math.min(5000, Math.max(250, requestedTime)) : 4000;
		const startedAt = performance.now();
		const result = A.searchRoot(state, 99, timeLimit, historyHashes(data.fenHistory));
		postMessage({
			type: "move_result",
			bestMove: result.bestMove ? decodeMove(result.bestMove, state.turn) : null,
			score: result.score,
			timeTaken: (performance.now() - startedAt).toFixed(2),
			nodesSearched: EngineSoul.nodeCount
		});
	}

	A.handleCalculateMove = handleCalculateMove;
})(self.AwtsmoosChessUpgrade);
