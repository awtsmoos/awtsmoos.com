// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayTextRenderer.js
 * @description Draws authored title cards, lower thirds, captions, and dialogue onto the exact movie overlay canvas.
 * The Awtsmoos is beyond letter and image while every finite word must remain legible upon the living frame;
 * Awtsmoos.com joins authored style, safe placement, wrapping, subtitle, and speaker without confusing their name.
 */

export function drawMovieOverlayTitle(overlay, title) {
	if (!title) return;
	const style = textStyle(title, 52);
	const context = overlay.context;
	const canvas = overlay.canvas;
	context.save();
	context.font = font(style);
	const lines = wrappedLines(context, title.text, canvas.width * style.maximumWidth).slice(0, 4);
	const subtitleLines = title.subtitle
		? wrappedLines(context, title.subtitle, canvas.width * style.maximumWidth).slice(0, 2)
		: [];
	const box = titleBox(canvas, title.position, title.variant, lines.length, subtitleLines.length, style);
	drawTextBox(context, box, style);
	context.textAlign = style.align;
	context.textBaseline = 'middle';
	context.fillStyle = style.color;
	context.font = font(style);
	drawCenteredLines(context, lines, box, style.fontSize, 0);
	if (subtitleLines.length) {
		context.globalAlpha = 0.86;
		context.font = font({ ...style, fontSize: style.fontSize * 0.52, fontWeight: 600 });
		drawCenteredLines(context, subtitleLines, box, style.fontSize * 0.62, style.fontSize * 1.1);
	}
	context.restore();
}

export function drawMovieOverlayCaption(overlay, caption) {
	if (!caption) return;
	const style = textStyle(caption, 34);
	const context = overlay.context;
	const canvas = overlay.canvas;
	context.save();
	context.font = font(style);
	const prefix = caption.speaker ? `${caption.speaker}: ` : '';
	const lines = wrappedLines(context, `${prefix}${caption.text}`, canvas.width * style.maximumWidth).slice(0, 4);
	const box = captionBox(canvas, caption.position, lines.length, style);
	drawTextBox(context, box, style);
	context.textAlign = style.align;
	context.textBaseline = 'middle';
	context.fillStyle = style.color;
	context.font = font(style);
	drawCenteredLines(context, lines, box, style.fontSize, 0);
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

function drawTextBox(context, box, style) {
	context.fillStyle = style.background;
	context.beginPath();
	context.roundRect(box.x, box.y, box.width, box.height, Math.max(12, style.fontSize * 0.48));
	context.fill();
}

function drawCenteredLines(context, lines, box, lineHeight, offset) {
	const total = lines.length * lineHeight;
	const start = box.y + box.height / 2 - total / 2 + lineHeight / 2 + offset;
	const x = context.textAlign === 'left' ? box.x + 26
		: context.textAlign === 'right' ? box.x + box.width - 26
			: box.x + box.width / 2;
	lines.forEach((line, index) => context.fillText(line, x, start + index * lineHeight));
}

function titleBox(canvas, position, variant, lineCount, subtitleCount, style) {
	const width = variant === 'lower-third' ? canvas.width * 0.58 : canvas.width * 0.82;
	const height = Math.max(84, (lineCount + subtitleCount * 0.62) * style.fontSize + 44);
	const x = variant === 'lower-third' ? canvas.width * 0.06 : (canvas.width - width) / 2;
	return { height, width, x, y: positionY(canvas.height, position, height, variant) };
}

function captionBox(canvas, position, lineCount, style) {
	const width = canvas.width * style.maximumWidth + 52;
	const height = Math.max(62, lineCount * style.fontSize * 1.15 + 30);
	return {
		height,
		width,
		x: (canvas.width - width) / 2,
		y: positionY(canvas.height, position, height, 'caption')
	};
}

function positionY(canvasHeight, position, height, variant) {
	if (position === 'top') return canvasHeight * 0.1;
	if (position === 'center') return (canvasHeight - height) / 2;
	return variant === 'lower-third' ? canvasHeight - height - canvasHeight * 0.12 : canvasHeight - height - 30;
}

function textStyle(clip, fallbackSize) {
	return {
		align: clip.style?.align || 'center',
		background: clip.style?.background || 'rgba(0,0,0,.74)',
		color: clip.style?.color || '#ffffff',
		fontFamily: clip.style?.fontFamily || 'system-ui',
		fontSize: Number(clip.style?.fontSize || fallbackSize),
		fontWeight: Number(clip.style?.fontWeight || 700),
		maximumWidth: Number(clip.style?.maximumWidth || 0.82)
	};
}

function font(style) {
	return `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
}

function wrappedLines(context, text, maximumWidth) {
	const output = [];
	for (const paragraph of String(text || '').split('\n')) {
		let current = '';
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			const proposed = current ? `${current} ${word}` : word;
			if (!current || context.measureText(proposed).width <= maximumWidth) current = proposed;
			else {
				output.push(current);
				current = word;
			}
		}
		if (current) output.push(current);
	}
	return output;
}
