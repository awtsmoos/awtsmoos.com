//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives one soul many garments, crown and glyph and flame;
 * Awtsmoos.com lets every player choose a face while chess remains the same.
 */

const PIECE_NAMES = Object.freeze({
	K: "king",
	Q: "queen",
	R: "rook",
	B: "bishop",
	N: "knight",
	P: "pawn"
});

const RAW_SETS = {
	staunton: {
		name: "Staunton Unicode",
		glyphs: {
			wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
			bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
		}
	},
	royal: {
		name: "Royal Characters",
		glyphs: {
			wK: "👑", wQ: "👸", wR: "🏰", wB: "🧙", wN: "🐎", wP: "⚪",
			bK: "🤴", bQ: "🧛", bR: "🏯", bB: "🥷", bN: "🐴", bP: "⚫"
		}
	},
	elemental: {
		name: "Elemental Realms",
		glyphs: {
			wK: "☀️", wQ: "✨", wR: "⛰️", wB: "🌬️", wN: "🦄", wP: "🔥",
			bK: "🌑", bQ: "🌌", bR: "🌋", bB: "🌊", bN: "🐉", bP: "❄️"
		}
	},
	minimal: {
		name: "Minimal Marks",
		glyphs: {
			wK: "K", wQ: "Q", wR: "R", wB: "B", wN: "N", wP: "●",
			bK: "k", bQ: "q", bR: "r", bB: "b", bN: "n", bP: "○"
		}
	}
};

export const CHARACTER_SETS = Object.freeze(
	Object.fromEntries(Object.entries(RAW_SETS).map(([id, set]) => [id, Object.freeze({ id, ...set })]))
);

export function getCharacterSet(characterId = "staunton") {
	return CHARACTER_SETS[characterId] || CHARACTER_SETS.staunton;
}

export function accessiblePieceName(piece) {
	if (!piece) {
		return "empty square";
	}
	const color = piece[0] === "w" ? "white" : "black";
	return `${color} ${PIECE_NAMES[piece[1]] || "piece"}`;
}
