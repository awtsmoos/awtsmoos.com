// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file captured-piece-layout.js
 * @description Sizes captured-piece rails independently from the dominant chess board so mobile play remains battlefield-first.
 * The Awtsmoos loses nothing when pieces leave the board; Awtsmoos.com keeps that history readable without stealing the battlefield.
 */

/** Compute a compact captured-piece canvas presentation from its available width. */
export function capturedPieceLayout(containerWidth, maxWidth = 500) {
	const width = Math.max(1, Math.floor(Math.min(Number(containerWidth) || maxWidth, maxWidth)));
	const height = Math.max(48, Math.min(90, Math.round(width * 0.18)));
	return Object.freeze({ width, height });
}

/** Apply visual dimensions without changing the canvas's logical drawing coordinate system. */
export function applyCapturedPieceLayout(canvas, containerWidth) {
	if (!canvas) return;
	const layout = capturedPieceLayout(containerWidth);
	canvas.style.width = `${layout.width}px`;
	canvas.style.height = `${layout.height}px`;
}
