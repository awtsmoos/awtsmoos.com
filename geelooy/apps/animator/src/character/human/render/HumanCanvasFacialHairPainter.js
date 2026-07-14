// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Beard and mustache are independent authored choices. The Awtsmoos renews each
 * contour; Awtsmoos.com renders stubble, boxed, full, long, goatee, pencil,
 * natural, handlebar, and walrus forms without tying them to gender labels.
 */
export class HumanCanvasFacialHairPainter {
	static paint(ctx, head, radiusX, radiusY, character, scale) {
		const facial = character.facialHair || character.design?.facialHair || {};
		const color = facial.color || character.hair?.color || '#2f1d16';
		this.beard(ctx, head, radiusX, radiusY, facial.beard || {}, color, scale);
		this.mustache(ctx, head, radiusX, facial.mustache || {}, color, scale);
	}

	static beard(ctx, head, radiusX, radiusY, beard, color, scale) {
		const style = beard.style || 'none';
		if (style === 'none') return;
		if (style === 'stubble') { ctx.save(); ctx.globalAlpha = 0.28; P.ellipse(ctx, head.x, head.y + radiusY * 0.34, radiusX * 0.72, radiusY * 0.52, color); ctx.restore(); return; }
		const lengthScale = Math.max(0.2, Number(beard.length || 0.45));
		const length = radiusY * ({ short: 0.42, boxed: 0.58, full: 0.82, long: 1.45, goatee: 0.78 }[style] || 0.7) * (0.65 + lengthScale);
		if (style === 'goatee') { P.ellipse(ctx, head.x, head.y + radiusY * 0.56, radiusX * 0.28, length * 0.54, color); return; }
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(head.x - radiusX * 0.78, head.y + radiusY * 0.12);
		ctx.quadraticCurveTo(head.x - radiusX * 0.7, head.y + length, head.x, head.y + radiusY * 0.62 + length * 0.5);
		ctx.quadraticCurveTo(head.x + radiusX * 0.7, head.y + length, head.x + radiusX * 0.78, head.y + radiusY * 0.12);
		ctx.quadraticCurveTo(head.x, head.y + radiusY * 0.85, head.x - radiusX * 0.78, head.y + radiusY * 0.12);
		ctx.fill();
	}

	static mustache(ctx, head, radiusX, mustache, color, scale) {
		const style = mustache.style || 'none';
		if (style === 'none') return;
		const thickness = Math.max(0.2, Number(mustache.thickness || 0.5));
		const width = radiusX * ({ pencil: 0.7, natural: 0.88, handlebar: 1.2, walrus: 1.05 }[style] || 0.85);
		const height = (3 + thickness * (style === 'walrus' ? 12 : 7)) * scale;
		ctx.strokeStyle = color;
		ctx.lineWidth = height;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(head.x - width * 0.5, head.y + 7 * scale);
		ctx.quadraticCurveTo(head.x - width * 0.18, head.y + height, head.x, head.y + 8 * scale);
		ctx.quadraticCurveTo(head.x + width * 0.18, head.y + height, head.x + width * 0.5, head.y + 7 * scale);
		ctx.stroke();
		if (style === 'handlebar') { P.ellipse(ctx, head.x - width * 0.58, head.y + 4 * scale, 7 * scale, 4 * scale, color); P.ellipse(ctx, head.x + width * 0.58, head.y + 4 * scale, 7 * scale, 4 * scale, color); }
	}
}
