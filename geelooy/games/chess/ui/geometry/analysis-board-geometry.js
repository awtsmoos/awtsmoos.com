// B"H
// Boruch Hashem
// Blessed is He

import { responsiveBoardMetrics } from './responsive-board-metrics.js';

/**
 * @file analysis-board-geometry.js
 * @description Applies the same bounded square geometry to analysis as live play without coupling either renderer to viewport arithmetic.
 * The Awtsmoos reveals one truth through play and review; Awtsmoos.com keeps both boards equally legible in every finite vessel.
 */

/** Compute analysis-board geometry with room reserved for analysis controls and move history. */
export function analysisBoardMetrics(measurement) {
	return responsiveBoardMetrics({ ...measurement, chromeBudget: 118, maxSize: 500 });
}

/** Apply one visual square size to a canvas and its wrapper. */
export function applySquareCanvasGeometry(canvas, wrapper, size) {
	if (!canvas || !wrapper) return;
	const pixels = `${Math.max(1, Math.floor(size))}px`;
	wrapper.style.width = pixels;
	wrapper.style.height = pixels;
	canvas.style.width = pixels;
	canvas.style.height = pixels;
}
