// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayTextLayout.js
 * @description Calculates bounded title/caption boxes, text styles, wrapping, and position-safe geometry.
 * The Awtsmoos is beyond measure and placement while every finite word needs room to remain clear;
 * Awtsmoos.com separates layout from painting so exact overlay vessels stay small and sincere.
 */

export function movieOverlayTextStyle(clip, fallbackSize) {
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

export function movieOverlayFont(style) {
	return `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
}

export function movieOverlayWrappedLines(context, text, maximumWidth) {
	const output = [];
	for (const paragraph of String(text || '').split('\n')) {
		let current = '';
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			const proposed = current ? `${current} ${word}` : word;
			if (!current || context.measureText(proposed).width <= maximumWidth) {
				current = proposed;
			} else {
				output.push(current);
				current = word;
			}
		}
		if (current) output.push(current);
	}
	return output;
}

export function movieOverlayTitleBox(
	canvas,
	position,
	variant,
	lineCount,
	subtitleCount,
	style
) {
	const width = variant === 'lower-third'
		? canvas.width * 0.58
		: canvas.width * 0.82;
	const height = Math.max(
		84,
		(lineCount + subtitleCount * 0.62) * style.fontSize + 44
	);
	const x = variant === 'lower-third'
		? canvas.width * 0.06
		: (canvas.width - width) / 2;
	return {
		height,
		width,
		x,
		y: movieOverlayPositionY(canvas.height, position, height, variant)
	};
}

export function movieOverlayCaptionBox(canvas, position, lineCount, style) {
	const width = canvas.width * style.maximumWidth + 52;
	const height = Math.max(62, lineCount * style.fontSize * 1.15 + 30);
	return {
		height,
		width,
		x: (canvas.width - width) / 2,
		y: movieOverlayPositionY(canvas.height, position, height, 'caption')
	};
}

function movieOverlayPositionY(canvasHeight, position, height, variant) {
	if (position === 'top') return canvasHeight * 0.1;
	if (position === 'center') return (canvasHeight - height) / 2;
	if (variant === 'lower-third') {
		return canvasHeight - height - canvasHeight * 0.12;
	}
	return canvasHeight - height - 30;
}
