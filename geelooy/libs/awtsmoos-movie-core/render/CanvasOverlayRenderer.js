//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasOverlayRenderer.js
 * @description Charts, tutorial markings, and patches are signs within signs as the Awtsmoos renews every frame;
 * Awtsmoos.com gathers these overlay vessels in one small renderer so guidance and data remain clear by name.
 */

/**
 * @description Draws one infographic, tutorial, or patch entity inside a translated canvas context.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical overlay entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box centered at the origin.
 * @returns {void}
 * @sideEffects Paints pixels and temporarily mutates canvas drawing styles.
 */
export function renderCanvasOverlay(context, entity, box) {
	if (entity.type === "infographic") {
		renderInfographic(context, entity, box);
		return;
	}
	if (entity.type === "tutorial") {
		renderTutorial(context, entity, box);
		return;
	}
	if (entity.type === "patch") {
		renderPatch(context, entity, box);
	}
}

/**
 * @description Draws a deterministic bar-chart representation of infographic values.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated infographic entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box.
 * @returns {void}
 * @sideEffects Paints bar rectangles on the active canvas context.
 */
function renderInfographic(context, entity, box) {
	const values = normalizeValues(entity.data?.values);
	const maximum = Math.max(1, ...values);
	const gap = box.width / (values.length * 1.5);
	context.fillStyle = entity.style?.fill || "#22d3ee";
	values.forEach(function drawBar(value, index) {
		const barHeight = (value / maximum) * box.height;
		const x = (-box.width / 2) + (gap * 0.25) + (index * gap * 1.5);
		context.fillRect(x, box.height / 2 - barHeight, gap, barHeight);
	});
}

/**
 * @description Draws a dashed tutorial focus box and directional corner marker.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated tutorial entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box.
 * @returns {void}
 * @sideEffects Paints tutorial pixels and mutates canvas dash/style state inside the caller's save scope.
 */
function renderTutorial(context, entity, box) {
	context.strokeStyle = entity.style?.stroke || "#facc15";
	context.lineWidth = entity.style?.lineWidth || 5;
	context.setLineDash([12, 8]);
	context.strokeRect(-box.width / 2, -box.height / 2, box.width, box.height);
	context.setLineDash([]);
	context.fillStyle = entity.style?.fill || "#facc15";
	context.beginPath();
	context.moveTo(box.width * 0.34, box.height * 0.28);
	context.lineTo(box.width * 0.5, box.height * 0.45);
	context.lineTo(box.width * 0.38, box.height * 0.43);
	context.closePath();
	context.fill();
}

/**
 * @description Draws a rectangular patch overlay.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated patch entity.
 * @param {{width:number,height:number}} box - Pixel-space entity box.
 * @returns {void}
 * @sideEffects Paints one rectangle on the active canvas context.
 */
function renderPatch(context, entity, box) {
	context.fillStyle = entity.style?.fill || "rgba(0,0,0,0.55)";
	context.fillRect(-box.width / 2, -box.height / 2, box.width, box.height);
}

/**
 * @description Normalizes infographic data into a finite non-empty numeric series.
 * @param {unknown} values - Candidate infographic values.
 * @returns {number[]} Finite numeric values with deterministic fallback data.
 * @sideEffects None.
 */
function normalizeValues(values) {
	if (!Array.isArray(values) || !values.length) {
		return [30, 55, 80, 45];
	}
	const finiteValues = values
		.map(Number)
		.filter(Number.isFinite);
	return finiteValues.length ? finiteValues : [30, 55, 80, 45];
}
