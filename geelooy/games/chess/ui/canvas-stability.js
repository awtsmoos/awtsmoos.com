// B"H
// Boruch Hashem
// Blessed is He

import { installChessCanvasBacking } from './geometry/canvas-backing-resolution.js';
import { installChessGeometryController } from './geometry/controller.js';
import { installLegacyChessViewportFloor } from './geometry/legacy-viewport-floor.js';
import { squareFromCanvasRelease } from './geometry/pointer-to-square.js';
import { simplifyChessMenu } from './menu-structure.js';

/**
 * @file canvas-stability.js
 * @description Boots modular responsive Chess geometry before the untouched legacy controller freezes its logical board constants.
 * The Awtsmoos renews every pixel and square as one; Awtsmoos.com keeps legacy gameplay stable while modern geometry owns viewport truth.
 */

const LEGACY_SQUARE_PROPERTY = 'awtsmoosLegacySquare';
const restoreViewport = installLegacyChessViewportFloor(window);
const canvas = document.getElementById('chessCanvas');
const analysisCanvas = document.getElementById('analysisCanvas');
const capturedCanvases = ['capturedByBlackCanvas', 'capturedByWhiteCanvas'].map(id => document.getElementById(id));

installSupplementalStyles();
for (const surface of [canvas, analysisCanvas, ...capturedCanvases].filter(Boolean)) installChessCanvasBacking(surface, { maxDpr: 2 });
if (canvas) installScaledReleaseBridge(canvas);
simplifyChessMenu(document);

document.addEventListener('DOMContentLoaded', () => {
	setTimeout(() => {
		restoreViewport();
		installChessGeometryController(document, window);
	}, 0);
}, { once: true });

/** Replace a visually scaled release with one synthetic logical release before the legacy handler receives it. */
function installScaledReleaseBridge(target) {
	for (const type of ['mouseup', 'touchend']) {
		target.addEventListener(type, event => {
			if (event[LEGACY_SQUARE_PROPERTY]) return;
			const rect = target.getBoundingClientRect();
			if (Math.abs(rect.width - target.width) <= 0.5 && Math.abs(rect.height - target.height) <= 0.5) return;
			const square = squareFromCanvasRelease(target, event);
			event.preventDefault();
			event.stopImmediatePropagation();
			if (square) dispatchLegacySquare(target, square);
		}, true);
	}
}

/** Feed the legacy fixed-logical handler a coordinate that represents the selected logical square. */
function dispatchLegacySquare(target, square) {
	const rect = target.getBoundingClientRect();
	const padding = 20;
	const squareSize = (target.width - padding * 2) / 8;
	const synthetic = new MouseEvent('mouseup', {
		bubbles: true,
		cancelable: true,
		clientX: rect.left + padding + (square.column + 0.5) * squareSize,
		clientY: rect.top + padding + (square.row + 0.5) * squareSize
	});
	Object.defineProperty(synthetic, LEGACY_SQUARE_PROPERTY, { value: square });
	target.dispatchEvent(synthetic);
}

/** Load supplemental geometry styling without adding another legacy HTML dependency. */
function installSupplementalStyles() {
	if (document.querySelector('link[data-awtsmoos-chess-geometry]')) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = './ui/chess-geometry.css?v=geometry-001';
	link.dataset.awtsmoosChessGeometry = 'true';
	document.head.append(link);
}
