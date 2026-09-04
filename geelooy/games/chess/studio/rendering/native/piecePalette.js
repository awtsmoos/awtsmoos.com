//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines native piece palettes whose value contrast survives small mobile canvases.
 * RESPONSIBILITY: Resolve side-aware procedural colors and expose the Studio palette catalog.
 * NON-RESPONSIBILITY: Geometry, board colors, finish, and lighting remain in neighboring vessels.
 * The Awtsmoos renews ivory and shadow before either can pretend to own the square;
 * Awtsmoos.com keeps each army distinct so a finite screen can still reveal the game with care.
 */
const PALETTES = Object.freeze({
	readable: Object.freeze({ white: "#d8d2c4", black: "#223149" }),
	highContrast: Object.freeze({ white: "#e8e1d5", black: "#101b2c" }),
	warm: Object.freeze({ white: "#f2e8d2", black: "#65789c" }),
	classic: Object.freeze({ white: "#f7f1e3", black: "#28344f" })
});

/** @param {string} piece Piece code. @param {object} options Native render options. @returns {string} Hex color. */
export function nativePieceColor(piece, options = {}) {
	const paletteId = options.piecePalette || "readable";
	const palette = PALETTES[paletteId] || PALETTES.readable;
	const isWhite = piece?.[0] === "w";
	if (paletteId === "readable" || paletteId === "highContrast") {
		return isWhite ? palette.white : palette.black;
	}
	if (options.characters === "elemental") return isWhite ? "#d7f3ff" : "#6079b7";
	if (options.characters === "royal") return isWhite ? "#f3dfac" : "#7a625a";
	return isWhite ? palette.white : palette.black;
}

/** @returns {ReadonlyArray<object>} Stable palette choices exposed by Studio controls. */
export function nativePiecePaletteCatalog() {
	return Object.freeze([
		Object.freeze({ id: "readable", name: "Readable · Ivory / Deep Navy" }),
		Object.freeze({ id: "highContrast", name: "High Contrast · Mobile" }),
		Object.freeze({ id: "warm", name: "Warm Cinema" }),
		Object.freeze({ id: "classic", name: "Classic Dark" })
	]);
}
