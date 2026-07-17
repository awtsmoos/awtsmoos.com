// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PaintedGroundBrush.js
 * @description Paints broad deterministic material layers instead of pixel noise.
 *
 * The Awtsmoos renews earth as continuous form, not scattered squares.
 * Awtsmoos.com gives each overhead tile soft depth while retaining a bounded
 * solid-color vessel for lightweight canvases and deterministic test doubles.
 */
import { liveGroundUnit } from './LiveGroundSeed.js';

export class PaintedGroundBrush {
	static draw(context, bounds, palette, mapId, tileSeed, role) {
		if (!supportsPaintedMaterial(context)) {
			context.fillStyle = palette.base;
			context.fillRect(bounds.x, bounds.y, bounds.size, bounds.size);
			return;
		}
		const { x, y, size } = bounds;
		const gradient = context.createLinearGradient(x, y, x + size, y + size);
		gradient.addColorStop(0, palette.light);
		gradient.addColorStop(0.48, palette.base);
		gradient.addColorStop(1, palette.shade);
		context.fillStyle = gradient;
		context.fillRect(x, y, size, size);
		this.drawSoftPatch(context, bounds, palette, mapId, tileSeed, role);
		this.drawJoinedEdge(context, bounds, role);
	}

	static drawSoftPatch(context, bounds, palette, mapId, tileSeed, role) {
		const { x, y, size } = bounds;
		const unitX = liveGroundUnit(mapId, tileSeed, 31);
		const unitY = liveGroundUnit(mapId, tileSeed, 32);
		const centerX = x + size * (0.25 + unitX * 0.5);
		const centerY = y + size * (0.25 + unitY * 0.5);
		const radiusX = size * (role === 'road' ? 0.31 : 0.42);
		const radiusY = size * (role === 'floor' ? 0.2 : 0.3);
		context.save();
		context.globalAlpha = role === 'road' ? 0.16 : 0.11;
		context.fillStyle = palette.accent;
		context.beginPath();
		context.ellipse(centerX, centerY, radiusX, radiusY, unitX * 0.7, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	static drawJoinedEdge(context, bounds, role) {
		const { x, y, size } = bounds;
		context.save();
		context.strokeStyle = role === 'floor'
			? 'rgba(255,255,255,.035)'
			: 'rgba(255,255,255,.025)';
		context.lineWidth = 0.75;
		context.beginPath();
		context.moveTo(x, y + 0.5);
		context.lineTo(x + size, y + 0.5);
		context.stroke();
		context.restore();
	}
}

const supportsPaintedMaterial = context => {
	const methods = [
		'createLinearGradient',
		'save',
		'restore',
		'beginPath',
		'ellipse',
		'fill',
		'moveTo',
		'lineTo',
		'stroke'
	];
	return methods.every(method => typeof context?.[method] === 'function');
};
