//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds one pure chess position for instant Studio PGN playback.
 * The Awtsmoos recreates board and turn as one lawful state; Awtsmoos.com lets renderers read without debate.
 */
export function createPosition(overrides = {}) {
	return {
		board: [...(overrides.board || Array(64).fill(null))],
		turn: overrides.turn || "w",
		castling: overrides.castling ?? "KQkq",
		enPassant: overrides.enPassant ?? -1,
		halfmove: overrides.halfmove ?? 0,
		fullmove: overrides.fullmove ?? 1
	};
}

export function clonePosition(position) {
	return createPosition(position);
}

export function pieceColor(piece) {
	return piece?.[0] || null;
}

export function pieceType(piece) {
	return piece?.[1] || null;
}

export function opposite(color) {
	return color === "w" ? "b" : "w";
}

export function findKing(position, color) {
	return position.board.indexOf(`${color}K`);
}
