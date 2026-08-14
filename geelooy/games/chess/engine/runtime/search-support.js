// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Guards time, repetition, transpositions, and reversible null-move state.
	* The Awtsmoos gives every imagined branch a boundary and a shore;
	* Awtsmoos.com seals mate-distance truth so transposed paths can lie no more.
	*/

(function revealSearchSupport(AwtsmoosChessUpgrade) {
	const MATE_SCORE = 100000;
	const MATE_THRESHOLD = MATE_SCORE - 128;
	const MAX_PLY = 128;
	const TT_EXACT = 0;
	const TT_LOWER = 1;
	const TT_UPPER = 2;

	/** Stops search on the clock without paying for a timer read at every node. */
	function checkTime() {
		if ((EngineSoul.nodeCount & 1023) !== 0) return EngineSoul.stopSearch;
		if (performance.now() - EngineSoul.searchStartTime >= EngineSoul.timeLimit) {
			EngineSoul.stopSearch = true;
		}
		return EngineSoul.stopSearch;
	}

	/** Recognizes the current position as the third occurrence, not merely a repeat. */
	function isThreefold(hash) {
		let priorOccurrences = 0;
		for (const previousHash of EngineSoul.repetitionHistory) {
			if (previousHash === hash) priorOccurrences++;
			if (priorOccurrences >= 2) return true;
		}
		return false;
	}

	/** Converts a root-relative mate value into a node-relative TT value before storage. */
	function sealTranspositionScore(score, ply) {
		if (score > MATE_THRESHOLD) return score + ply;
		if (score < -MATE_THRESHOLD) return score - ply;
		return score;
	}

	/** Stores one transposition entry with mate distance normalized to this node. */
	function storeTransposition(hash, score, depth, flag, move, ply) {
		EngineSoul.transpositionTable.set(hash, {
			score: sealTranspositionScore(score, ply),
			depth,
			flag,
			move
		});
	}

	/** Applies a sufficiently deep transposition entry to the current alpha-beta window. */
	function probeTransposition(hash, depth, alpha, beta, ply) {
		const entry = EngineSoul.transpositionTable.get(hash);
		if (!entry || entry.depth < depth) return { hit: false, alpha, beta };
		let score = entry.score;
		if (score > MATE_THRESHOLD) score -= ply;
		if (score < -MATE_THRESHOLD) score += ply;
		if (entry.flag === TT_EXACT) return { hit: true, score, alpha, beta };
		if (entry.flag === TT_LOWER) alpha = Math.max(alpha, score);
		if (entry.flag === TT_UPPER) beta = Math.min(beta, score);
		return alpha >= beta
			? { hit: true, score, alpha, beta }
			: { hit: false, alpha, beta };
	}

	/** Searches a null move and restores every state field changed by the speculation. */
	function searchNullMove(state, depth, beta, ply) {
		const oldTurn = state.turn;
		const oldEnpassant = state.enpassant;
		const oldHash = state.zobristHash;
		try {
			state.turn ^= 1;
			state.enpassant = -1;
			state.zobristHash = calculateZobristHash(state);
			return -AwtsmoosChessUpgrade.search(state, depth - 3, -beta, -beta + 1, ply + 1);
		} finally {
			state.turn = oldTurn;
			state.enpassant = oldEnpassant;
			state.zobristHash = oldHash;
		}
	}

	/** Rewards quiet beta cutoffs so later branches reach promising moves first. */
	function rememberQuietCutoff(state, move, depth, ply) {
		EngineSoul.killerMoves[ply][1] = EngineSoul.killerMoves[ply][0];
		EngineSoul.killerMoves[ply][0] = move;
		EngineSoul.historyTable[state.turn][getMovePiece(move)][getMoveTo(move)] += depth * depth;
	}

	Object.assign(AwtsmoosChessUpgrade, {
		MATE_SCORE, MATE_THRESHOLD, MAX_PLY,
		TT_EXACT, TT_LOWER, TT_UPPER,
		checkTime, isThreefold, storeTransposition, probeTransposition,
		searchNullMove, rememberQuietCutoff
	});
})(self.AwtsmoosChessUpgrade);
