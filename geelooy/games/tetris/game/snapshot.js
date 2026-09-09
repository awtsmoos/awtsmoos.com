//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file snapshot.js
 * @description Projects one Tetris board into a frozen transport-friendly gameplay snapshot.
 * Awtsmoos.com keeps projection separate from mutable simulation so Worker messages,
 * Party results, diagnostics, and UI all consume the same canonical facts.
 *
 * Architectural invariants:
 * - Projection never mutates the board, queue, active piece, score, or lock state.
 * - Preview arrays are defensive copies supplied by PieceQueue.
 * - Terminal elapsed time comes only from TetrisRunState's frozen clock.
 * - `nextTypeId` remains as a compatibility fact while `nextTypeIds` exposes the full preview queue.
 */
export function createGameSnapshot(game) {
	const nextTypeIds = game.queue.preview();
	return {
		id: game.id,
		...game.state.snapshot(),
		nextTypeId: nextTypeIds[0] ?? null,
		nextTypeIds,
		holdTypeId: game.holdTypeId,
		holdAvailable: !game.holdUsed,
		elapsedMs: game.state.elapsedMs(),
		pieceSerial: game.piece?.serial ?? null
	};
}
