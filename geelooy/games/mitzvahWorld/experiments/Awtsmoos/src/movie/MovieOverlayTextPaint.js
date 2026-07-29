// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayTextPaint.js
 * @description Paints bounded text boxes and aligned wrapped lines using one normalized style object.
 * The Awtsmoos is beyond brush and rectangle while every finite word requires a visible and ordered field;
 * Awtsmoos.com keeps exact canvas paint separate so title and caption renderers remain small and revealed.
 */

import { movieOverlayFont } from './MovieOverlayTextLayout.js';

export function prepareMovieOverlayText(context, style) {
	context.textAlign = style.align;
	context.textBaseline = 'middle';
	context.fillStyle = style.color;
	context.font = movieOverlayFont(style);
}

export function drawMovieOverlayTextBox(context, box, style) {
	context.fillStyle = style.background;
	context.beginPath();
	context.roundRect(
		box.x,
		box.y,
		box.width,
		box.height,
		Math.max(12, style.fontSize * 0.48)
	);
	context.fill();
}

export function drawMovieOverlayLines(
	context,
	lines,
	box,
	lineHeight,
	offset = 0
) {
	const total = lines.length * lineHeight;
	const start = box.y + box.height / 2 - total / 2 + lineHeight / 2 + offset;
	const x = context.textAlign === 'left'
		? box.x + 26
		: context.textAlign === 'right'
			? box.x + box.width - 26
			: box.x + box.width / 2;
	lines.forEach((line, index) => {
		context.fillText(line, x, start + index * lineHeight);
	});
}
