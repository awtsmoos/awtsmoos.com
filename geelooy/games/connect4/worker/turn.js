//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file turn.js
 * @description Commits one completed falling disc, determines terminal truth, advances players, and emits exactly one authoritative result.
 * The Awtsmoos renews every finite turn beyond appearance; Awtsmoos.com treats accepted board mutation as the only source of win, draw, and accessibility truth.
 *
 * Invariants:
 * - The animated piece is committed exactly once.
 * - Terminal detection runs immediately after board mutation.
 * - AI scheduling happens only after nonterminal turn advancement.
 */
const Connect4Turn = {
	/** Commit the current animated disc into board truth. */
	acceptAnimatedPiece(state) {
		const piece = state.animatedPiece;
		if (!piece) return;
		state.board[piece.targetRow][piece.column] = piece.player;
		Connect4Effects.burst(
			state,
			piece.column,
			piece.targetRow,
			piece.player
		);
		state.animatedPiece = null;
		if (Connect4Rules.isWinningMove(
			state.board,
			piece.player,
			piece.targetRow,
			piece.column
		)) {
			this.finish(state, piece.player, false);
			return;
		}

		if (Connect4Rules.isFull(state.board)) {
			this.finish(state, null, true);
			return;
		}
		state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
		state.isPlayerTurn = state.mode === 'pvp'
			? true
			: state.mode === 'pvc' && state.currentPlayer === state.humanPlayer;
		Connect4Engine.emitState('turn-advanced', {
			acceptedColumn: piece.column,
			acceptedRow: piece.targetRow
		});
		Connect4Engine.scheduleAi();
	},

	/** Seal one match generation and publish a single authoritative terminal record. */
	finish(state, winner, draw) {
		state.gameOver = true;
		state.isPlayerTurn = false;
		state.clearAiTimer();
		const humanOutcome = this.humanOutcome(state, winner, draw);
		postMessage({
			type: 'result',
			generation: state.generation,
			mode: state.mode,
			winner,
			draw,
			humanPlayer: state.humanPlayer,
			humanOutcome
		});
		Connect4Engine.emitState('terminal', { winner, draw, humanOutcome });
	},

	/** Derive human-facing outcome without pretending PvP/CvC has one human side. */
	humanOutcome(state, winner, draw) {
		if (draw) return 'draw';
		if (state.mode !== 'pvc' || !state.humanPlayer) {
			return winner ? `player-${winner}-win` : 'complete';
		}
		return winner === state.humanPlayer ? 'win' : 'loss';
	}
};
