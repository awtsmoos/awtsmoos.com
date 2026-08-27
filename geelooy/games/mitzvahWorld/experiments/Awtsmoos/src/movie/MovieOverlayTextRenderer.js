// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayTextRenderer.js
 * @description Draws authored title cards, lower thirds, captions, and dialogue onto the exact overlay canvas.
 * The Awtsmoos is beyond letter and image while every finite word must remain legible upon the living frame;
 * Awtsmoos.com joins authored style, safe placement, wrapping, subtitle, and speaker without confusing their name.
 */

import {
	movieOverlayCaptionBox,
	movieOverlayFont,
	movieOverlayTextStyle,
	movieOverlayTitleBox,
	movieOverlayWrappedLines
} from './MovieOverlayTextLayout.js';
import {
	drawMovieOverlayLines,
	drawMovieOverlayTextBox,
	prepareMovieOverlayText
} from './MovieOverlayTextPaint.js';

export function drawMovieOverlayTitle(overlay, title) {
	if (!title) return;
	const style = movieOverlayTextStyle(title, 52);
	const context = overlay.context;
	const canvas = overlay.canvas;
	context.save();
	context.font = movieOverlayFont(style);
	const lines = movieOverlayWrappedLines(
		context,
		title.text,
		canvas.width * style.maximumWidth
	).slice(0, 4);
	const subtitleLines = title.subtitle
		? movieOverlayWrappedLines(
			context,
			title.subtitle,
			canvas.width * style.maximumWidth
		).slice(0, 2)
		: [];
	const box = movieOverlayTitleBox(
		canvas,
		title.position,
		title.variant,
		lines.length,
		subtitleLines.length,
		style
	);
	drawMovieOverlayTextBox(context, box, style);
	prepareMovieOverlayText(context, style);
	drawMovieOverlayLines(context, lines, box, style.fontSize);
	if (subtitleLines.length) {
		context.globalAlpha = 0.86;
		context.font = movieOverlayFont({
			...style,
			fontSize: style.fontSize * 0.52,
			fontWeight: 600
		});
		drawMovieOverlayLines(
			context,
			subtitleLines,
			box,
			style.fontSize * 0.62,
			style.fontSize * 1.1
		);
	}
	context.restore();
}

export function drawMovieOverlayCaption(overlay, caption) {
	if (!caption) return;
	const style = movieOverlayTextStyle(caption, 34);
	const context = overlay.context;
	const canvas = overlay.canvas;
	context.save();
	context.font = movieOverlayFont(style);
	const prefix = caption.speaker ? `${caption.speaker}: ` : '';
	const lines = movieOverlayWrappedLines(
		context,
		`${prefix}${caption.text}`,
		canvas.width * style.maximumWidth
	).slice(0, 4);
	const box = movieOverlayCaptionBox(
		canvas,
		caption.position,
		lines.length,
		style
	);
	drawMovieOverlayTextBox(context, box, style);
	prepareMovieOverlayText(context, style);
	drawMovieOverlayLines(context, lines, box, style.fontSize);
	context.restore();
}

export function drawMovieOverlayDialogue(overlay, dialogue) {
	if (!dialogue) return;
	drawMovieOverlayCaption(overlay, {
		position: 'bottom',
		speaker: dialogue.speaker || 'Narrator',
		style: { fontSize: 27, maximumWidth: 0.82 },
		text: dialogue.text
	});
}
