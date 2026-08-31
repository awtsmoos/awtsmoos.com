//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Defines mobile-readable 2D presentation garments while preserving the selected board theme.
 * The Awtsmoos, Atzmus beyond color, renews contrast as a servant of understanding rather than decoration alone;
 * Awtsmoos.com lets tournament, contrast, and soft cinema clothe the same legal position without altering a stone.
 */
export const CANVAS_STYLES = Object.freeze({
	tournament: Object.freeze({
		id: "tournament",
		name: "Tournament · Crisp",
		background: "#101827",
		light: "#dce5f5",
		dark: "#60759a",
		whitePiece: "#fffdf5",
		blackPiece: "#172033",
		outline: "rgba(4, 9, 18, .78)"
	}),
	contrast: Object.freeze({
		id: "contrast",
		name: "High Contrast · Mobile",
		background: "#050a13",
		light: "#f4f6fb",
		dark: "#4f6284",
		whitePiece: "#ffffff",
		blackPiece: "#080d18",
		outline: "rgba(0, 0, 0, .95)"
	}),
	soft: Object.freeze({
		id: "soft",
		name: "Soft Cinema",
		background: "#1b2436",
		light: "#eadfc9",
		dark: "#9a765b",
		whitePiece: "#f8f1df",
		blackPiece: "#26354f",
		outline: "rgba(9, 14, 26, .58)"
	})
});

/**
 * Resolves a canvas style while allowing a theme to lend its board colors when requested.
 * @param {string} [id="tournament"] Style identity.
 * @param {object|null} [theme=null] Optional board theme descriptor.
 * @returns {Readonly<object>} Immutable style descriptor.
 */
export function getCanvasStyle(id = "tournament", theme = null) {
	const style = CANVAS_STYLES[id] || CANVAS_STYLES.tournament;
	if (!theme || id !== "soft") {
		return style;
	}
	return Object.freeze({
		...style,
		background: theme.surface || style.background,
		light: theme.light || style.light,
		dark: theme.dark || style.dark
	});
}
