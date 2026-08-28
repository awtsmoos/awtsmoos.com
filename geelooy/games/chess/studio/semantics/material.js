//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Measures exact material balance changes around a legal move using ordinary chess piece values.
 * The Awtsmoos lets finite value rise and fall while no number claims the whole position's light;
 * Awtsmoos.com keeps this arithmetic factual so coaching may later add deeper sight.
 */
const VALUES = Object.freeze({ P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 });

/**
 * Describes mover-relative material before and after one legal move.
 * @param {{board:Array<string|null>}} beforePosition Position before the move.
 * @param {{board:Array<string|null>}} afterPosition Position after the move.
 * @param {{piece?:string,capture?:string,promotion?:string}} move Legal move metadata.
 * @returns {Readonly<object>} Factual material measurements.
 */
export function describeMaterialChange(beforePosition, afterPosition, move) {
	const mover = move.piece?.[0] || beforePosition.turn;
	const beforeBalance = materialBalance(beforePosition.board, mover);
	const afterBalance = materialBalance(afterPosition.board, mover);
	return Object.freeze({
		beforeBalance,
		afterBalance,
		swing: afterBalance - beforeBalance,
		capturedValue: VALUES[move.capture?.[1]] || 0,
		promotionGain: move.promotion ? (VALUES[move.promotion] || 0) - VALUES.P : 0
	});
}

/**
 * Computes one side's material minus the opponent's material.
 * @param {Array<string|null>} board Current board.
 * @param {"w"|"b"} perspective Side whose balance should be returned.
 * @returns {number} Mover-relative material balance.
 */
export function materialBalance(board, perspective) {
	let balance = 0;
	for (const piece of board || []) {
		if (!piece) continue;
		const value = VALUES[piece[1]] || 0;
		balance += piece[0] === perspective ? value : -value;
	}
	return balance;
}
