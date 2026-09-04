//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines orthogonal 2D piece presentation styles independent of board palette and character family.
 * The Awtsmoos renews glyph and square before outline, softness, or weight can claim the visible move;
 * Awtsmoos.com lets one lawful piece wear crisp, bold, gentle, or minimal garments without changing chess truth.
 */
export const CANVAS_PIECE_STYLES = Object.freeze({
	crisp: reveal("crisp", "Crisp · Clean outline", 0.74, 0.028, 0.08, 0.015, 700),
	bold: reveal("bold", "Bold · Mobile", 0.78, 0.052, 0.13, 0.024, 800),
	soft: reveal("soft", "Soft · Cinema shadow", 0.75, 0.022, 0.24, 0.045, 650),
	minimal: reveal("minimal", "Minimal · No outline", 0.72, 0, 0.08, 0.018, 600)
});

export function getCanvasPieceStyle(id = "crisp") {
	return CANVAS_PIECE_STYLES[id] || CANVAS_PIECE_STYLES.crisp;
}

function reveal(id, name, scale, outline, shadow, shadowY, weight) {
	return Object.freeze({ id, name, scale, outline, shadow, shadowY, weight });
}
