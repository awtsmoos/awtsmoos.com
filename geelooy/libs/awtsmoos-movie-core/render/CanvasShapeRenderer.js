//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasShapeRenderer.js
 * @description Rectangles, ellipses, lines, and arrows are finite keilim through which the Awtsmoos reveals motion;
 * Awtsmoos.com keeps their path law isolated so semantic rendering stays clear across every cinematic ocean.
 */

/**
 * @description Draws one canonical shape entity inside an already translated canvas context.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical shape entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box centered at the origin.
 * @returns {void}
 * @sideEffects Mutates the active canvas path and paints fill/stroke pixels.
 */
export function renderCanvasShape(context, entity, box) {
	context.fillStyle = entity.style?.fill || "#7c3aed";
	context.strokeStyle = entity.style?.stroke || "transparent";
	context.lineWidth = entity.style?.lineWidth || 2;
	context.beginPath();
	buildShapePath(context, entity.shape, box);
	context.fill();
	context.stroke();
}

/**
 * @description Builds the geometric path for one supported canonical shape name.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {string} shape - Canonical shape name.
 * @param {{width:number,height:number}} box - Pixel-space entity box.
 * @returns {void}
 * @sideEffects Mutates the active canvas path.
 */
function buildShapePath(context, shape, box) {
	if (shape === "ellipse") {
		context.ellipse(0, 0, box.width / 2, box.height / 2, 0, 0, Math.PI * 2);
		return;
	}
	if (shape === "line") {
		context.moveTo(-box.width / 2, 0);
		context.lineTo(box.width / 2, 0);
		return;
	}
	if (shape === "arrow") {
		buildArrowPath(context, box.width, box.height);
		return;
	}
	context.rect(-box.width / 2, -box.height / 2, box.width, box.height);
}

/**
 * @description Builds a right-facing arrow path centered inside the supplied bounds.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {number} width - Arrow width in pixels.
 * @param {number} height - Arrow height in pixels.
 * @returns {void}
 * @sideEffects Mutates the active canvas path.
 */
function buildArrowPath(context, width, height) {
	context.moveTo(-width / 2, -height * 0.12);
	context.lineTo(width * 0.15, -height * 0.12);
	context.lineTo(width * 0.15, -height * 0.32);
	context.lineTo(width / 2, 0);
	context.lineTo(width * 0.15, height * 0.32);
	context.lineTo(width * 0.15, height * 0.12);
	context.lineTo(-width / 2, height * 0.12);
	context.closePath();
}
