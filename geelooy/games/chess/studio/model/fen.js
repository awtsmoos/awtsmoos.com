//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Folds and unfolds a complete chess position through standard FEN speech.
 * The Awtsmoos hides sixty-four vessels in one line; Awtsmoos.com reveals them again in measured design.
 */
import { createPosition } from "./position.js";
import { squareIndex, squareName } from "./squares.js";

export const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PIECES = "prnbqkPRNBQK";

export function parseFen(fen = STARTING_FEN) {
	const parts = String(fen).trim().split(/\s+/);
	if (parts.length < 4) throw new Error("FEN requires board, turn, castling, and en-passant fields.");
	const board = [];
	for (const row of parts[0].split("/")) {
		for (const token of row) {
			if (/^[1-8]$/.test(token)) board.push(...Array(Number(token)).fill(null));
			else if (PIECES.includes(token)) board.push(`${token === token.toUpperCase() ? "w" : "b"}${token.toUpperCase()}`);
			else throw new Error(`Invalid FEN token: ${token}`);
		}
	}
	if (board.length !== 64) throw new Error("FEN board must contain 64 squares.");
	return createPosition({
		board,
		turn: parts[1] === "b" ? "b" : "w",
		castling: parts[2] === "-" ? "" : parts[2],
		enPassant: parts[3] === "-" ? -1 : squareIndex(parts[3]),
		halfmove: Number(parts[4] || 0),
		fullmove: Number(parts[5] || 1)
	});
}

export function toFen(position) {
	const rows = [];
	for (let row = 0; row < 8; row++) rows.push(fenRow(position.board.slice(row * 8, row * 8 + 8)));
	return `${rows.join("/")} ${position.turn} ${position.castling || "-"} ${position.enPassant < 0 ? "-" : squareName(position.enPassant)} ${position.halfmove} ${position.fullmove}`;
}

function fenRow(squares) {
	let text = "";
	let empty = 0;
	for (const piece of squares) {
		if (!piece) {
			empty++;
			continue;
		}
		if (empty) text += empty;
		empty = 0;
		text += piece[0] === "w" ? piece[1] : piece[1].toLowerCase();
	}
	return text + (empty || "");
}
