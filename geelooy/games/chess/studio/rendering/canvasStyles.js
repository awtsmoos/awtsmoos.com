//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines deliberate 2D board garments for study, play, cinema, night use, and high-contrast mobile viewing.
 * The Awtsmoos, Atzmus beyond every color, renews one lawful position beneath many finite palettes of sight;
 * Awtsmoos.com lets classic wood, green field, parchment, midnight, and tournament blue reveal the same move in light.
 */
export const CANVAS_STYLES = Object.freeze({
	classic: style("classic", "Classic · Walnut", "#20160f", "#f0d9b5", "#b58863", "#fffaf0", "#24170f", "rgba(25, 12, 4, .78)"),
	tournament: style("tournament", "Tournament · Blue", "#101827", "#dce5f5", "#60759a", "#fffdf5", "#172033", "rgba(4, 9, 18, .78)"),
	garden: style("garden", "Garden · Green", "#142018", "#e8edcf", "#779556", "#fffdf3", "#17241a", "rgba(5, 16, 8, .8)"),
	parchment: style("parchment", "Parchment · Warm", "#2a1d12", "#f3e0b5", "#b98a5a", "#fff8e8", "#2a1c12", "rgba(36, 20, 8, .82)"),
	midnight: style("midnight", "Midnight · Slate", "#050a13", "#b9c9e2", "#425675", "#f4f8ff", "#0d1728", "rgba(0, 0, 0, .92)"),
	contrast: style("contrast", "High Contrast · Mobile", "#02050a", "#ffffff", "#4b638c", "#ffffff", "#05070c", "rgba(0, 0, 0, .98)"),
	soft: Object.freeze({
		...style("soft", "Theme · Soft", "#1b2436", "#eadfc9", "#9a765b", "#f8f1df", "#26354f", "rgba(9, 14, 26, .58)"),
		useThemeBoard: true
	})
});

/**
 * Resolves a canvas style while allowing the soft garment to borrow the selected theme's board colors.
 * @param {string} [id="tournament"] Style identity.
 * @param {object|null} [theme=null] Optional board theme descriptor.
 * @returns {Readonly<object>} Immutable style descriptor consumed by all canvas renderers.
 */
export function getCanvasStyle(id = "tournament", theme = null) {
	const selected = CANVAS_STYLES[id] || CANVAS_STYLES.tournament;
	if (!theme || !selected.useThemeBoard) {
		return selected;
	}

	return Object.freeze({
		...selected,
		background: theme.surface || selected.background,
		light: theme.light || selected.light,
		dark: theme.dark || selected.dark
	});
}

/**
 * Creates one immutable style record so every palette carries the same rendering contract.
 * @returns {Readonly<object>} Frozen canvas style.
 */
function style(id, name, background, light, dark, whitePiece, blackPiece, outline) {
	return Object.freeze({ id, name, background, light, dark, whitePiece, blackPiece, outline });
}
