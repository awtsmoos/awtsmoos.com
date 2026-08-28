//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Answers whether one square is attacked without recursively generating legal moves.
 * The Awtsmoos measures every ray and leap; Awtsmoos.com guards the king while the board stays deep.
 */
import { colOf, offsetSquare, rowOf } from "../model/squares.js";

const KNIGHTS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KINGS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const BISHOP_RAYS = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOK_RAYS = [[-1,0],[1,0],[0,-1],[0,1]];

export function isSquareAttacked(position, target, attacker) {
	if (pawnAttacks(position, target, attacker)) return true;
	if (leaperAttacks(position, target, attacker, "N", KNIGHTS)) return true;
	if (leaperAttacks(position, target, attacker, "K", KINGS)) return true;
	if (rayAttacks(position, target, attacker, new Set(["B", "Q"]), BISHOP_RAYS)) return true;
	return rayAttacks(position, target, attacker, new Set(["R", "Q"]), ROOK_RAYS);
}

function pawnAttacks(position, target, attacker) {
	const sourceRowDelta = attacker === "w" ? 1 : -1;
	for (const colDelta of [-1, 1]) {
		const source = offsetSquare(target, sourceRowDelta, colDelta);
		if (source >= 0 && position.board[source] === `${attacker}P`) return true;
	}
	return false;
}

function leaperAttacks(position, target, attacker, type, offsets) {
	return offsets.some(([row, col]) => {
		const source = offsetSquare(target, row, col);
		return source >= 0 && position.board[source] === `${attacker}${type}`;
	});
}

function rayAttacks(position, target, attacker, types, rays) {
	for (const [rowDelta, colDelta] of rays) {
		let row = rowOf(target) + rowDelta;
		let col = colOf(target) + colDelta;
		while (row >= 0 && row < 8 && col >= 0 && col < 8) {
			const piece = position.board[row * 8 + col];
			if (piece) {
				if (piece[0] === attacker && types.has(piece[1])) return true;
				break;
			}
			row += rowDelta;
			col += colDelta;
		}
	}
	return false;
}
