// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayTextPaint.js
 * @description Paints backgrounds, outlined lines, and shallow curved phrase text from one normalized style.
 * The Awtsmoos is beyond brush, border, and arc while every finite phrase needs a visible field;
 * Awtsmoos.com lets white letters ride a dark edge and gentle curve without sacrificing the clarity revealed.
 */

import { movieOverlayFont } from './MovieOverlayTextLayout.js';

export function prepareMovieOverlayText(context, style) {
	context.textAlign = style.align;
	context.textBaseline = 'middle';
	context.fillStyle = style.color;
	context.font = movieOverlayFont(style);
	context.lineJoin = 'round';
	context.strokeStyle = style.strokeColor;
	context.lineWidth = style.strokeWidth;
}

export function drawMovieOverlayTextBox(context, box, style) {
	if (!style.background || style.background === 'transparent') return;
	context.fillStyle = style.background;
	context.beginPath();
	context.roundRect(box.x, box.y, box.width, box.height, Math.max(12, style.fontSize * 0.48));
	context.fill();
}

export function drawMovieOverlayLines(context, lines, box, lineHeight, offset = 0) {
	const total = lines.length * lineHeight;
	const start = box.y + box.height / 2 - total / 2 + lineHeight / 2 + offset;
	const x = lineX(context, box);
	lines.forEach((line, index) => paintText(context, line, x, start + index * lineHeight));
}

export function drawMovieOverlayCurvedLines(context, lines, box, style) {
	const lineHeight = style.fontSize * 1.18;
	const total = lines.length * lineHeight;
	const start = box.y + box.height / 2 - total / 2 + lineHeight / 2;
	lines.forEach((line, index) => {
		paintCurvedLine(context, line, box.x + box.width / 2, start + index * lineHeight, style);
	});
}

function paintCurvedLine(context, text, centerX, baselineY, style) {
	const characters = [...String(text || '')];
	const widths = characters.map(character => context.measureText(character).width);
	const totalWidth = widths.reduce((sum, width) => sum + width, 0);
	let cursor = centerX - totalWidth / 2;
	const bend = style.curve * style.fontSize;
	characters.forEach((character, index) => {
		const width = widths[index];
		const x = cursor + width / 2;
		const normalized = totalWidth ? (x - centerX) / (totalWidth / 2) : 0;
		const y = baselineY - bend * (1 - normalized * normalized);
		const angle = totalWidth ? (2 * bend * normalized) / totalWidth : 0;
		context.save();
		context.translate(x, y);
		context.rotate(angle);
		context.textAlign = 'center';
		paintText(context, character, 0, 0);
		context.restore();
		cursor += width;
	});
}

function paintText(context, text, x, y) {
	if (context.lineWidth > 0) context.strokeText(text, x, y);
	context.fillText(text, x, y);
}

function lineX(context, box) {
	if (context.textAlign === 'left') return box.x + 26;
	if (context.textAlign === 'right') return box.x + box.width - 26;
	return box.x + box.width / 2;
}
