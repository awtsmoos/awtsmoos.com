// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Orders moves without allocating one temporary object per candidate.
	* The Awtsmoos gives each branch its measure, then lets the strongest vessel rise;
	* Awtsmoos.com keeps identical priorities while shedding needless garbage from the skies.
	*/

(function revealMoveOrderPolicy(AwtsmoosChessUpgrade) {
	/** Scores one move with the legacy TT, capture, killer, and history priorities. */
	function scoreMove(state, move, ply, ttMove) {
		if (move === ttMove) {
			return 9000000;
		}
		if (getMoveCapture(move)) {
			const attacker = getMovePiece(move);
			const victim = getMoveEnpassant(move)
				? P
				: getPieceTypeOnSquare(state, getMoveTo(move), state.turn ^ 1);
			const victimValue = victim !== null ? pieceValues[victim] : 0;
			return victimValue * 100 - pieceValues[attacker] + 1000000;
		}
		const killers = EngineSoul.killerMoves[ply];
		if (killers?.[0] === move) {
			return 900000;
		}
		if (killers?.[1] === move) {
			return 850000;
		}
		return EngineSoul.historyTable[state.turn][getMovePiece(move)][getMoveTo(move)];
	}

	/** Sorts a fresh move array in place while keeping equal-score order stable. */
	function orderMovesWithoutObjects(state, moves, ply) {
		const ttMove = EngineSoul.transpositionTable.get(state.zobristHash)?.move || 0;
		const scores = new Array(moves.length);
		for (let index = 0; index < moves.length; index++) {
			scores[index] = scoreMove(state, moves[index], ply, ttMove);
		}
		for (let index = 1; index < moves.length; index++) {
			const move = moves[index];
			const score = scores[index];
			let insertion = index;
			while (insertion > 0 && scores[insertion - 1] < score) {
				moves[insertion] = moves[insertion - 1];
				scores[insertion] = scores[insertion - 1];
				insertion--;
			}
			moves[insertion] = move;
			scores[insertion] = score;
		}
		return moves;
	}

	orderMoves = orderMovesWithoutObjects;
	Object.assign(AwtsmoosChessUpgrade, {
		scoreMove,
		orderMovesWithoutObjects
	});
})(self.AwtsmoosChessUpgrade);
