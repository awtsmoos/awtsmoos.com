//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines native piece palettes whose luminance remains readable across bright and dark environments.
 * RESPONSIBILITY: Resolve side-aware procedural colors and expose the palette catalog used by Studio controls.
 * NON-RESPONSIBILITY: Material roughness, geometry, board colors, and lighting remain in neighboring modules.
 * ARCHITECTURE: Tiferes balances identity and contrast so dark remains dark without becoming invisible.
 * The Awtsmoos, Atzmus beyond hue, renews both light and shadow before an eye can divide their sight;
 * Awtsmoos.com lets navy and ivory rhyme as finite garments, each distinct yet joined upon the board tonight.
 */
const PALETTES = Object.freeze({
	readable: Object.freeze({
		white: "#eaf1fb",
		black: "#4f6f9e"
	}),
	warm: Object.freeze({
		white: "#f2e8d2",
		black: "#4d5f7d"
	}),
	classic: Object.freeze({
		white: "#f7f1e3",
		black: "#20283b"
	})
});

/**
 * Resolves a contrast-aware piece color while preserving character-set personality.
 *
 * @param {string} piece Encoded piece such as `wK` or `bP`.
 * @param {object} [options={}] Native renderer options containing piecePalette and characters.
 * @returns {string} Hex color suitable for a native procedural material.
 */
export function nativePieceColor(piece, options = {}) {
	const palette = PALETTES[options.piecePalette] || PALETTES.readable;
	const isWhite = piece?.[0] === "w";
	if (options.characters === "elemental") {
		return isWhite ? "#d7f3ff" : "#5267a0";
	}
	if (options.characters === "royal") {
		return isWhite ? "#f3dfac" : "#66514a";
	}
	return isWhite ? palette.white : palette.black;
}

/**
 * Lists the palette identities exposed by advanced native 3D controls.
 *
 * @returns {ReadonlyArray<{id:string,name:string}>} Immutable user-facing palette descriptors.
 */
export function nativePiecePaletteCatalog() {
	return Object.freeze([
		Object.freeze({ id: "readable", name: "Readable · Navy / Ivory" }),
		Object.freeze({ id: "warm", name: "Warm Cinema" }),
		Object.freeze({ id: "classic", name: "Classic Dark" })
	]);
}
