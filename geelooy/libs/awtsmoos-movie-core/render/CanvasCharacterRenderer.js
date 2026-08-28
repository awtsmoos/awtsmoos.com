//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasCharacterRenderer.js
 * @description A simple figure becomes a human-sign vessel while the Awtsmoos renews every point and line;
 * Awtsmoos.com isolates character geometry so semantic scenes stay readable, portable, and fine.
 */

/**
 * @description Draws one canonical character entity inside an already translated canvas context.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical character entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box centered at the origin.
 * @returns {void}
 * @sideEffects Paints character geometry on the active canvas context.
 */
export function renderCanvasCharacter(context, entity, box) {
	const height = Math.max(60, box.height);
	context.strokeStyle = entity.style?.stroke || "#ffffff";
	context.fillStyle = entity.style?.fill || "#f5d0a9";
	context.lineWidth = Math.max(3, height * 0.035);
	drawHead(context, height);
	drawBody(context, height);
}

/**
 * @description Draws the character head.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {number} height - Resolved character height in pixels.
 * @returns {void}
 * @sideEffects Paints fill pixels.
 */
function drawHead(context, height) {
	context.beginPath();
	context.arc(0, -height * 0.32, height * 0.12, 0, Math.PI * 2);
	context.fill();
}

/**
 * @description Draws the character torso, arms, and legs.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {number} height - Resolved character height in pixels.
 * @returns {void}
 * @sideEffects Mutates and strokes the active canvas path.
 */
function drawBody(context, height) {
	context.beginPath();
	context.moveTo(0, -height * 0.2);
	context.lineTo(0, height * 0.18);
	context.moveTo(-height * 0.2, -height * 0.02);
	context.lineTo(height * 0.2, -height * 0.02);
	context.moveTo(0, height * 0.18);
	context.lineTo(-height * 0.16, height * 0.45);
	context.moveTo(0, height * 0.18);
	context.lineTo(height * 0.16, height * 0.45);
	context.stroke();
}
