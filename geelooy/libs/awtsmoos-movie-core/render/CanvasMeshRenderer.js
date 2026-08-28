//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasMeshRenderer.js
 * @description A flat canvas hints at depth while the Awtsmoos renews front, back, and connecting line;
 * Awtsmoos.com keeps this pseudo-mesh law isolated so hybrid scenes can grow toward truer three-dimensional design.
 */

/**
 * @description Draws the existing pseudo-3D mesh treatment inside a translated canvas context.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical mesh entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box centered at the origin.
 * @returns {void}
 * @sideEffects Paints rectangles and connector strokes on the active canvas context.
 */
export function renderCanvasMesh(context, entity, box) {
	const depth = resolveDepth(box);
	context.fillStyle = entity.style?.fill || "#6366f1";
	context.fillRect(-box.width / 2, -box.height / 2, box.width, box.height);
	context.strokeStyle = entity.style?.stroke || "#c4b5fd";
	context.strokeRect(
		(-box.width / 2) + depth,
		(-box.height / 2) - depth,
		box.width,
		box.height
	);
	drawDepthConnectors(context, box, depth);
}

/**
 * @description Resolves a bounded pseudo-depth from the entity dimensions.
 * @param {{width:number,height:number}} box - Pixel-space entity box.
 * @returns {number} Positive pseudo-depth in pixels.
 * @sideEffects None.
 */
function resolveDepth(box) {
	return Math.max(12, Math.min(box.width, box.height) * 0.18);
}

/**
 * @description Draws the visible connectors between front and displaced back faces.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {{width:number,height:number}} box - Pixel-space entity box.
 * @param {number} depth - Positive pseudo-depth in pixels.
 * @returns {void}
 * @sideEffects Mutates and strokes the active canvas path.
 */
function drawDepthConnectors(context, box, depth) {
	context.beginPath();
	context.moveTo(-box.width / 2, -box.height / 2);
	context.lineTo((-box.width / 2) + depth, (-box.height / 2) - depth);
	context.moveTo(box.width / 2, -box.height / 2);
	context.lineTo((box.width / 2) + depth, (-box.height / 2) - depth);
	context.stroke();
}
