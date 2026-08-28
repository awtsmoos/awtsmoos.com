//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasPathRenderer.js
 * @description A teaching curve crosses the whole visible vessel while the Awtsmoos renews every point in its appointed place;
 * Awtsmoos.com preserves normalized movie paths as strokes, so a line of meaning is never mistaken for a rectangular face.
 */

/**
 * @description Draws one normalized canonical path inside an already translated full-viewport entity box.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated canonical shape entity carrying data.points.
 * @param {{width:number,height:number}} box - Pixel-space full-viewport entity box centered at the origin.
 * @returns {void}
 * @sideEffects Mutates the active canvas path, dash, and stroke styles inside the caller's save scope.
 */
export function renderCanvasPath(context, entity, box) {
	const points = normalizePathPoints(entity.data?.points);
	if (points.length < 2) {
		return;
	}
	context.strokeStyle = entity.style?.stroke || "rgba(255,255,255,0.8)";
	context.lineWidth = entity.style?.lineWidth || Math.max(2, box.width * 0.005);
	context.setLineDash(resolveDash(entity.style?.dash));
	context.beginPath();
	for (let index = 0; index < points.length; index += 1) {
		const [x, y] = points[index];
		const pointX = (x - 0.5) * box.width;
		const pointY = (y - 0.5) * box.height;
		if (index === 0) {
			context.moveTo(pointX, pointY);
		} else {
			context.lineTo(pointX, pointY);
		}
	}
	context.stroke();
	context.setLineDash([]);
}

/**
 * @description Filters candidate path points into finite normalized coordinate pairs.
 * @param {unknown} points - Candidate normalized path point collection.
 * @returns {Array<[number, number]>} Finite coordinate pairs in authored order.
 * @sideEffects None.
 */
function normalizePathPoints(points) {
	if (!Array.isArray(points)) {
		return [];
	}
	return points.filter(function isFinitePoint(point) {
		return Array.isArray(point)
			&& point.length >= 2
			&& Number.isFinite(Number(point[0]))
			&& Number.isFinite(Number(point[1]));
	}).map(function normalizePoint(point) {
		return [Number(point[0]), Number(point[1])];
	});
}

/**
 * @description Resolves an optional authored dash pattern with the shared-protocol teaching-line default.
 * @param {unknown} dash - Candidate dash pattern.
 * @returns {number[]} Canvas line-dash segments.
 * @sideEffects None.
 */
function resolveDash(dash) {
	if (Array.isArray(dash) && dash.every(Number.isFinite)) {
		return [...dash];
	}
	return [10, 8];
}
