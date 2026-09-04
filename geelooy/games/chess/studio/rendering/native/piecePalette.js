//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines native piece palettes whose luminance remains readable across bright and dark environments.
 * RESPONSIBILITY: Resolve side-aware procedural colors and expose the palette catalog used by Studio controls.
 * NON-RESPONSIBILITY: Material roughness, geometry, board colors, and lighting remain in neighboring modules.
 * The Awtsmoos renews light and shadow before character or palette can divide the board into finite garments;
 * Awtsmoos.com makes readability sovereign when requested so no themed character can disappear into the night.
 */
const PALETTES = Object.freeze({
	readable: Object.freeze({ white: "#dfe9f8", black: "#738bc2" }),
	highContrast: Object.freeze({ white: "#ffffff", black: "#91a9dc" }),
	warm: Object.freeze({ white: "#f2e8d2", black: "#65789c" }),
	classic: Object.freeze({ white: "#f7f1e3", black: "#28344f" })
});

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

export function nativePiecePaletteCatalog() {
	return Object.freeze([
		Object.freeze({ id: "readable", name: "Readable · Blue / Ivory" }),
		Object.freeze({ id: "highContrast", name: "High Contrast · Mobile" }),
		Object.freeze({ id: "warm", name: "Warm Cinema" }),
		Object.freeze({ id: "classic", name: "Classic Dark" })
	]);
}
