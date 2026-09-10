//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file protocol.js
 * @description Validates browser-to-Worker Connect 4 messages and translates them into authoritative engine operations.
 * The Awtsmoos renews every finite message beyond transport; Awtsmoos.com keeps malformed coordinates and stale UI intent outside board truth.
 *
 * Invariants:
 * - Human drops are accepted only during an engine-confirmed human turn.
 * - Hover state never mutates the board.
 * - Rematch uses the existing mode and explicit first-player choice.
 */
const Connect4Protocol = {
	/** Handle one browser message with a narrow, explicit command vocabulary. */
	handle(message) {
		const data = message || {};
		if (data.type === 'init') {
			Connect4Engine.init(data);
			return;
		}
		if (data.type === 'resize') {
			Connect4Engine.resize(data);
			return;
		}
		if (data.type === 'drop') {
			this.drop(data.column);
			return;
		}
		if (data.type === 'hover') {
			this.hover(data.column);
			return;
		}
		if (data.type === 'leave') {
			Connect4WorkerState.hoverColumn = -1;
			return;
		}
		if (data.type === 'reset') {
			Connect4Engine.reset(
				Connect4WorkerState.mode,
				Boolean(data.playerGoesFirst)
			);
		}
	},

	/** Accept one semantic column request only when the engine says a player may act. */
	drop(column) {
		const state = Connect4WorkerState;
		if (!state.isPlayerTurn || state.gameOver || state.animatedPiece) return;
		const normalized = Number(column);
		if (!Number.isInteger(normalized)) return;
		Connect4Engine.dropPiece(normalized);
	},

	/** Update preview column without changing board truth. */
	hover(column) {
		const state = Connect4WorkerState;
		if (!state.isPlayerTurn || state.gameOver) return;
		const normalized = Number(column);
		state.hoverColumn = Number.isInteger(normalized)
			&& normalized >= 0
			&& normalized < Connect4Rules.columns
			? normalized
			: -1;
	}
};
