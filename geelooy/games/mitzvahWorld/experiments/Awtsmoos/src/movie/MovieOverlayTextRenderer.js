// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayTextRenderer.js
 * @description Draws multilingual title cards and one primary-plus-secondary caption vessel with independent reading directions.
 * The Awtsmoos is beyond letter and image while every finite word needs room upon the living frame;
 * Awtsmoos.com keeps English dominant above a smaller Hebrew or future-language line, each measured and painted in its own direction.
 */

import {
	movieOverlayCaptionBox,
	movieOverlayFont,
	movieOverlayTextStyle,
	movieOverlayTitleBox,
	movieOverlayWrappedLines
} from './MovieOverlayTextLayout.js';
import {
	drawMovieOverlayCurvedLines,
	drawMovieOverlayLines,
	drawMovieOverlayTextBox,
	prepareMovieOverlayText
} from './MovieOverlayTextPaint.js';
import { normalizeMovieTextDirection } from './MovieTextDirection.js';

export function drawMovieOverlayTitle(overlay, title) {
	if (!title) return;
	const style = movieOverlayTextStyle(title, 52);
	const context = overlay.context;
	const canvas = overlay.canvas;
	context.save();
	applyDirection(context, title);
	context.font = movieOverlayFont(style);
	const lines = movieOverlayWrappedLines(context, title.text, canvas.width * style.maximumWidth).slice(0, 4);
	const subtitleLines = title.subtitle
		? movieOverlayWrappedLines(context, title.subtitle, canvas.width * style.maximumWidth).slice(0, 2)
		: [];
	const box = movieOverlayTitleBox(canvas, title.position, title.variant, lines.length, subtitleLines.length, style);
	drawMovieOverlayTextBox(context, box, style);
	prepareMovieOverlayText(context, style);
	drawMovieOverlayLines(context, lines, box, style.fontSize);
	if (subtitleLines.length) drawSubtitle(context, subtitleLines, box, style);
	context.restore();
}

export function drawMovieOverlayCaption(overlay, caption) {
	if (!caption) return;
	const context = overlay.context;
	const canvas = overlay.canvas;
	const style = movieOverlayTextStyle(caption, 34);
	const secondary = caption.secondaryCaption || null;
	const secondaryStyle = secondary
		? movieOverlayTextStyle({ style: secondary.style }, Math.max(18, style.fontSize * 0.58))
		: null;
	context.save();
	applyDirection(context, caption);
	context.font = movieOverlayFont(style);
	const prefix = caption.speaker ? `${caption.speaker}: ` : '';
	const lines = movieOverlayWrappedLines(context, `${prefix}${caption.text}`, canvas.width * style.maximumWidth).slice(0, 4);
	const secondaryLines = secondary ? wrappedSecondary(context, canvas, secondary, secondaryStyle) : [];
	const ratio = secondaryStyle ? secondaryStyle.fontSize / style.fontSize : 0;
	const weightedLines = lines.length + secondaryLines.length * ratio + (secondaryLines.length ? 0.35 : 0);
	const box = movieOverlayCaptionBox(canvas, caption.position, weightedLines, style);
	drawMovieOverlayTextBox(context, box, style);
	drawPrimaryCaption(context, lines, box, style, secondaryLines.length > 0);
	if (secondaryLines.length) drawSecondaryCaption(context, secondary, secondaryLines, box, style, secondaryStyle, lines.length);
	context.restore();
}

export function drawMovieOverlayDialogue(overlay, dialogue) {
	if (!dialogue) return;
	drawMovieOverlayCaption(overlay, {
		direction: dialogue.direction,
		language: dialogue.language || 'en',
		position: 'bottom',
		speaker: dialogue.speaker || 'Narrator',
		style: { fontSize: 27, maximumWidth: 0.82 },
		text: dialogue.text
	});
}

function wrappedSecondary(context, canvas, secondary, style) {
	context.save();
	applyDirection(context, secondary);
	context.font = movieOverlayFont(style);
	const lines = movieOverlayWrappedLines(context, secondary.text, canvas.width * style.maximumWidth).slice(0, 2);
	context.restore();
	return lines;
}

function drawPrimaryCaption(context, lines, box, style, hasSecondary) {
	applyDirection(context, { direction: context.direction });
	prepareMovieOverlayText(context, style);
	const height = lines.length * style.fontSize * 1.18 + (hasSecondary ? 12 : box.height * 0.14);
	const primaryBox = { ...box, height, y: box.y + 8 };
	if (style.curve) drawMovieOverlayCurvedLines(context, lines, primaryBox, style);
	else drawMovieOverlayLines(context, lines, primaryBox, style.fontSize);
}

function drawSecondaryCaption(context, secondary, lines, box, primaryStyle, style, primaryCount) {
	applyDirection(context, secondary);
	prepareMovieOverlayText(context, { ...style, background: 'transparent', curve: 0 });
	const primaryHeight = primaryCount * primaryStyle.fontSize * 1.18 + 12;
	const secondaryBox = { ...box, height: Math.max(30, box.height - primaryHeight - 10), y: box.y + primaryHeight };
	drawMovieOverlayLines(context, lines, secondaryBox, style.fontSize * 1.12);
}

function applyDirection(context, clip) {
	context.direction = normalizeMovieTextDirection(clip.direction, clip.language);
}

function drawSubtitle(context, lines, box, style) {
	context.globalAlpha = 0.86;
	const subtitleStyle = { ...style, fontSize: style.fontSize * 0.52, fontWeight: 600 };
	context.font = movieOverlayFont(subtitleStyle);
	drawMovieOverlayLines(context, lines, box, style.fontSize * 0.62, style.fontSize * 1.1);
}
