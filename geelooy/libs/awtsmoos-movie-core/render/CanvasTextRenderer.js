//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasTextRenderer.js
 * @description Words become visible vessels while the Awtsmoos renews meaning and matter in one living frame;
 * Awtsmoos.com gives text one focused renderer so typography stays simple, semantic, and tame.
 */

/**
 * @description Draws one canonical text entity inside an already translated canvas context.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical text entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box centered at the origin.
 * @returns {void}
 * @sideEffects Paints text pixels and updates canvas text styles.
 */
export function renderCanvasText(context, entity, box) {
	context.fillStyle = entity.style?.fill || "#ffffff";
	context.font = createFont(entity.style || {});
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(String(entity.text || ""), 0, 0, Math.max(20, box.width));
}

/**
 * @description Builds the canvas font declaration from renderer-neutral style fields.
 * @param {object} style - Canonical entity style.
 * @returns {string} Canvas-compatible font declaration.
 * @sideEffects None.
 */
function createFont(style) {
	const weight = style.weight || 700;
	const fontSize = style.fontSize || 42;
	return `${weight} ${fontSize}px system-ui, sans-serif`;
}
