//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Generates pseudo-legal chess moves and lawful castling candidates for one side.
 * The Awtsmoos reveals each possible path before choice is made; Awtsmoos.com bounds every leap and ray by chess law displayed.
 */
import { colOf, offsetSquare, rowOf } from "../model/squares.js";
import { isSquareAttacked } from "./attacks.js";
const KNIGHTS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KINGS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const BISHOPS = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOKS = [[-1,0],[1,0],[0,-1],[0,1]];

export function pseudoMoves(position) {
	const moves = [];
	for (let from = 0; from < 64; from++) {
		const piece = position.board[from];
		if (!piece || piece[0] !== position.turn) continue;
		if (piece[1] === "P") pawnMoves(position, from, moves);
		else if (piece[1] === "N") leapMoves(position, from, KNIGHTS, moves);
		else if (piece[1] === "B") rayMoves(position, from, BISHOPS, moves);
		else if (piece[1] === "R") rayMoves(position, from, ROOKS, moves);
		else if (piece[1] === "Q") rayMoves(position, from, [...BISHOPS, ...ROOKS], moves);
		else if (piece[1] === "K") kingMoves(position, from, moves);
	}
	return moves;
}

function addMove(position, from, to, moves, extras = {}) {
	const target = position.board[to];
	if (target?.[0] === position.turn) return false;
	moves.push({ from, to, piece: position.board[from], capture: target || extras.capture || null, ...extras });
	return !target;
}

function pawnMoves(position, from, moves) {
	const color = position.turn;
	const direction = color === "w" ? -1 : 1;
	const startRow = color === "w" ? 6 : 1;
	const promotionRow = color === "w" ? 0 : 7;
	const one = offsetSquare(from, direction, 0);
	if (one >= 0 && !position.board[one]) {
		pushPawn(position, from, one, promotionRow, moves);
		const two = offsetSquare(from, direction * 2, 0);
		if (rowOf(from) === startRow && two >= 0 && !position.board[two]) addMove(position, from, two, moves, { doublePawn: true });
	}
	for (const colDelta of [-1, 1]) {
		const to = offsetSquare(from, direction, colDelta);
		if (to < 0) continue;
		const target = position.board[to];
		if (target && target[0] !== color) pushPawn(position, from, to, promotionRow, moves);
		else if (to === position.enPassant) {
			const captureSquare = offsetSquare(to, -direction, 0);
			if (position.board[captureSquare] === `${color === "w" ? "b" : "w"}P`) addMove(position, from, to, moves, { enPassant: true, captureSquare, capture: position.board[captureSquare] });
		}
	}
}

function pushPawn(position, from, to, promotionRow, moves) {
	if (rowOf(to) !== promotionRow) return void addMove(position, from, to, moves);
	for (const promotion of ["Q", "R", "B", "N"]) addMove(position, from, to, moves, { promotion });
}

function leapMoves(position, from, offsets, moves) {
	for (const [row, col] of offsets) {
		const to = offsetSquare(from, row, col);
		if (to >= 0) addMove(position, from, to, moves);
	}
}

function rayMoves(position, from, rays, moves) {
	for (const [rowDelta, colDelta] of rays) {
		let row = rowOf(from) + rowDelta;
		let col = colOf(from) + colDelta;
		while (row >= 0 && row < 8 && col >= 0 && col < 8) {
			if (!addMove(position, from, row * 8 + col, moves)) break;
			row += rowDelta;
			col += colDelta;
		}
	}
}

function kingMoves(position, from, moves) {
	leapMoves(position, from, KINGS, moves);
	const color = position.turn;
	const enemy = color === "w" ? "b" : "w";
	const home = color === "w" ? 60 : 4;
	if (from !== home || isSquareAttacked(position, home, enemy)) return;
	const rights = position.castling || "";
	if (rights.includes(color === "w" ? "K" : "k") && position.board[home + 3] === `${color}R` && !position.board[home + 1] && !position.board[home + 2] && !isSquareAttacked(position, home + 1, enemy) && !isSquareAttacked(position, home + 2, enemy)) addMove(position, from, home + 2, moves, { castle: "king" });
	if (rights.includes(color === "w" ? "Q" : "q") && position.board[home - 4] === `${color}R` && !position.board[home - 1] && !position.board[home - 2] && !position.board[home - 3] && !isSquareAttacked(position, home - 1, enemy) && !isSquareAttacked(position, home - 2, enemy)) addMove(position, from, home - 2, moves, { castle: "queen" });
}
