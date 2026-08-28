//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the sixty-four vessels of the chess board without hidden state.
 * The Awtsmoos renews each rank and file while Awtsmoos.com gives every square a name in rhyme.
 */
export const FILES = "abcdefgh";

export function rowOf(index) {
	return Math.floor(index / 8);
}

export function colOf(index) {
	return index % 8;
}

export function isSquare(index) {
	return Number.isInteger(index) && index >= 0 && index < 64;
}

export function squareName(index) {
	if (!isSquare(index)) return "";
	return `${FILES[colOf(index)]}${8 - rowOf(index)}`;
}

export function squareIndex(name) {
	if (!/^[a-h][1-8]$/i.test(name || "")) return -1;
	return (8 - Number(name[1])) * 8 + FILES.indexOf(name[0].toLowerCase());
}

export function offsetSquare(index, rowDelta, colDelta) {
	const row = rowOf(index) + rowDelta;
	const col = colOf(index) + colDelta;
	if (row < 0 || row > 7 || col < 0 || col > 7) return -1;
	return row * 8 + col;
}
