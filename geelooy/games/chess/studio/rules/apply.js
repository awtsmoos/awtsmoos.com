//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies one fully described move while preserving castling, en-passant, clocks, and reversibility by cloning.
 * The Awtsmoos turns potential into deed; Awtsmoos.com carries every consequence the next position will need.
 */
import { clonePosition, opposite } from "../model/position.js";

export function applyMove(position, move) {
	const next = clonePosition(position);
	const color = position.turn;
	const piece = position.board[move.from];
	const captured = move.enPassant ? position.board[move.captureSquare] : position.board[move.to];
	next.board[move.from] = null;
	if (move.enPassant) next.board[move.captureSquare] = null;
	next.board[move.to] = move.promotion ? `${color}${move.promotion}` : piece;
	if (move.castle) moveCastleRook(next.board, color, move.castle);
	next.castling = updatedCastling(position.castling, piece, move.from, move.to, captured);
	next.enPassant = move.doublePawn ? (move.from + move.to) / 2 : -1;
	next.halfmove = piece?.[1] === "P" || captured ? 0 : position.halfmove + 1;
	next.fullmove = position.fullmove + (color === "b" ? 1 : 0);
	next.turn = opposite(color);
	return next;
}

function moveCastleRook(board, color, side) {
	const home = color === "w" ? 56 : 0;
	if (side === "king") {
		board[home + 5] = board[home + 7];
		board[home + 7] = null;
		return;
	}
	board[home + 3] = board[home];
	board[home] = null;
}

function updatedCastling(rights, piece, from, to, captured) {
	let value = rights || "";
	if (piece === "wK") value = value.replace(/[KQ]/g, "");
	if (piece === "bK") value = value.replace(/[kq]/g, "");
	if (from === 63 || to === 63) value = value.replace("K", "");
	if (from === 56 || to === 56) value = value.replace("Q", "");
	if (from === 7 || to === 7) value = value.replace("k", "");
	if (from === 0 || to === 0) value = value.replace("q", "");
	if (captured === "wR" && to === 63) value = value.replace("K", "");
	if (captured === "wR" && to === 56) value = value.replace("Q", "");
	if (captured === "bR" && to === 7) value = value.replace("k", "");
	if (captured === "bR" && to === 0) value = value.replace("q", "");
	return value;
}
