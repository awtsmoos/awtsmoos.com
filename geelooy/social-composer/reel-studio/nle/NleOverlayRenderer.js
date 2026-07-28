// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleOverlayRenderer
 * @description
 * Titles and dialogue enter legible finite regions while the Awtsmoos remains
 * beyond words; Awtsmoos.com animates only opacity and position deterministically.
 */

export function drawNleOverlay(context, asset, localTime, duration, canvas) {
	if (!asset || asset.kind !== 'title') return;
	const progress = Math.min(1, Math.max(0, localTime / Math.max(0.001, duration)));
	const fade = Math.min(1, progress * 5, (1 - progress) * 5);
	const rise = asset.animation === 'rise' ? (1 - Math.min(1, progress * 4)) * 34 : 0;
	const width = canvas.width;
	const height = canvas.height;
	context.save();
	context.globalAlpha = Math.max(0, fade);
	context.fillStyle = asset.background || 'rgba(3, 7, 14, .46)';
	context.fillRect(width * 0.08, height * 0.65, width * 0.84, height * 0.24);
	context.fillStyle = asset.color || '#ffffff';
	context.textAlign = asset.align || 'center';
	context.textBaseline = 'middle';
	context.font = `800 ${scaledFont(asset.fontSize, width)}px Inter, system-ui, sans-serif`;
	wrapText(context, asset.text || asset.label, width / 2, height * 0.74 + rise, width * 0.72, scaledFont(asset.fontSize, width) * 1.08);
	if (asset.subtext) {
		context.globalAlpha *= 0.78;
		context.font = `600 ${Math.max(16, scaledFont(asset.fontSize, width) * 0.34)}px Inter, system-ui, sans-serif`;
		context.fillText(asset.subtext, width / 2, height * 0.84 + rise);
	}
	context.restore();
}

function scaledFont(value, width) {
	return Math.max(22, Number(value || 72) * Math.min(1, width / 1280));
}

function wrapText(context, text, x, y, maximumWidth, lineHeight) {
	const words = String(text || '').split(/\s+/);
	const lines = [];
	let line = '';
	for (const word of words) {
		const candidate = line ? `${line} ${word}` : word;
		if (context.measureText(candidate).width > maximumWidth && line) {
			lines.push(line);
			line = word;
		} else line = candidate;
	}
	if (line) lines.push(line);
	const origin = y - (lines.length - 1) * lineHeight / 2;
	lines.slice(0, 3).forEach((value, index) => context.fillText(value, x, origin + index * lineHeight));
}
