// B"H
// Boruch Hashem
// Blessed is He

import { analysisBoardMetrics, applySquareCanvasGeometry } from './analysis-board-geometry.js';
import { applyCapturedPieceLayout } from './captured-piece-layout.js';
import { measureChessContainer } from './container-measurement.js';
import { observeChessGeometry } from './resize-observer.js';
import { responsiveBoardMetrics } from './responsive-board-metrics.js';

/**
 * @file controller.js
 * @description Coordinates responsive live, analysis, and captured-piece geometry without owning chess state or rendering.
 * The Awtsmoos renews every boundary as one; Awtsmoos.com measures unconstrained hosts so a prior narrow orientation cannot trap the next.
 */

/** Install responsive geometry for every ordinary Chess surface and return teardown. */
export function installChessGeometryController(documentObject = document, windowObject = window) {
	const viewportHost = documentObject.documentElement;
	const boardWrapper = documentObject.getElementById('board-wrapper');
	const boardCanvas = documentObject.getElementById('chessCanvas');
	const analysisWrapper = documentObject.getElementById('analysis-board-wrapper');
	const analysisCanvas = documentObject.getElementById('analysisCanvas');
	const captured = [...documentObject.querySelectorAll('.captured-pieces-container')];
	const capturedCanvases = ['capturedByBlackCanvas', 'capturedByWhiteCanvas'].map(id => documentObject.getElementById(id));
	const update = () => {
		const boardMeasure = measureChessContainer(viewportHost, windowObject);
		const board = responsiveBoardMetrics({ ...boardMeasure, containerWidth: Math.min(500, boardMeasure.containerWidth) });
		applySquareCanvasGeometry(boardCanvas, boardWrapper, board.visualSize);
		const analysisMeasure = measureChessContainer(viewportHost, windowObject);
		const analysis = analysisBoardMetrics({ ...analysisMeasure, containerWidth: Math.min(500, analysisMeasure.containerWidth) });
		applySquareCanvasGeometry(analysisCanvas, analysisWrapper, analysis.visualSize);
		capturedCanvases.forEach((canvas, index) => {
			const measurement = measureChessContainer(captured[index], windowObject);
			applyCapturedPieceLayout(canvas, measurement.containerWidth);
		});
	};
	return observeChessGeometry([viewportHost, ...captured], update, windowObject);
}
