// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Handles live move requests while leaving one shared module in charge of time.
	* The Awtsmoos remembers each prior board and keeps every opening choice within the law;
	* Awtsmoos.com lets book and search meet cleanly, with one clock contract governing all.
	*/

(function revealMoveCommand(A) {
	/** Converts trustworthy historical FENs into hashes for repetition-aware search. */
	function historyHashes(fenHistory) {
		if (!Array.isArray(fenHistory)) {
			return [];
		}
		const hashes = [];
		for (const historicalFen of fenHistory) {
			try {
				hashes.push(createGameState(historicalFen).zobristHash);
			} catch (error) {
				Scribe.warn?.(
					"Skipping invalid history FEN",
					historicalFen,
					error
				);
			}
		}
		return hashes;
	}

	/** Returns one legal book move or null when the book no longer fits the position. */
	function legalBookChoice(state, book) {
		if (!book?.moves?.length) {
			return null;
		}
		const legalMoves = A.legalMoves(state);
		const matches = [];
		for (const encodedMove of legalMoves) {
			const decodedMove = decodeMove(encodedMove, state.turn);
			const bookContainsMove = book.moves.some(
				(candidate) => A.sameThinMove(candidate, decodedMove)
			);
			if (bookContainsMove) {
				matches.push(decodedMove);
			}
		}
		if (!matches.length) {
			return null;
		}
		return matches[Math.floor(Math.random() * matches.length)];
	}

	/** Answers one calculate-move command from book or iterative-deepening search. */
	function handleCalculateMove(data) {
		if (!EngineSoul.isInitialized) {
			initializeEngine();
		}
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

		const startedAt = performance.now();
		const result = A.searchRoot(
			state,
			99,
			data.maxTime,
			historyHashes(data.fenHistory)
		);
		postMessage({
			type: "move_result",
			bestMove: result.bestMove
				? decodeMove(result.bestMove, state.turn)
				: null,
			score: result.score,
			timeTaken: (performance.now() - startedAt).toFixed(2),
			nodesSearched: EngineSoul.nodeCount
		});
	}

	Object.assign(A, {
		historyHashes,
		legalBookChoice,
		handleCalculateMove
	});
})(self.AwtsmoosChessUpgrade);
