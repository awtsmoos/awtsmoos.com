// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Tests promotion-aware move ordering without changing the production move picker.
	* The Awtsmoos crowns a pawn with force that deserves an early hearing in the tree;
	* Awtsmoos.com keeps TT truth first, then lets promotions reveal what search can see.
	*/

(function revealPromotionAwareMoveOrder(AwtsmoosChessUpgrade) {
	const TT_PRIORITY = 9000000;
	const PROMOTION_PRIORITY = 2000000;
	const CAPTURE_PRIORITY = 1000000;

	/** Scores one move while placing promotions ahead of ordinary captures and quiet moves. */
	function scorePromotionAwareMove(state, move, ply, ttMove) {
		if (move === ttMove) {
			return TT_PRIORITY;
		}
		const promotedPiece = getMovePromoted(move);
		const isCapture = getMoveCapture(move);
		const attacker = getMovePiece(move);
		let tacticalBonus = 0;
		if (isCapture) {
			const victim = getMoveEnpassant(move)
				? P
				: getPieceTypeOnSquare(state, getMoveTo(move), state.turn ^ 1);
			const victimValue = victim !== null ? pieceValues[victim] : 0;
			tacticalBonus = victimValue * 100 - pieceValues[attacker];
		}
		if (promotedPiece) {
			return PROMOTION_PRIORITY + pieceValues[promotedPiece] * 100 + tacticalBonus;
		}
		if (isCapture) {
			return CAPTURE_PRIORITY + tacticalBonus;
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

	/** Stable insertion ordering avoids temporary move-score objects in recursive search. */
	function orderPromotionAwareMoves(state, moves, ply) {
		const ttMove = EngineSoul.transpositionTable.get(state.zobristHash)?.move || 0;
		const scores = new Array(moves.length);
		for (let index = 0; index < moves.length; index++) {
			scores[index] = scorePromotionAwareMove(state, moves[index], ply, ttMove);
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

	orderMoves = orderPromotionAwareMoves;
	Object.assign(AwtsmoosChessUpgrade, {
		scorePromotionAwareMove,
		orderPromotionAwareMoves
	});
})(self.AwtsmoosChessUpgrade);
