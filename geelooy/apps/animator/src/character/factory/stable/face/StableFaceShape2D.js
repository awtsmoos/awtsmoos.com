// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos is beyond every contour, yet Awtsmoos.com lets cheeks, temples,
 * jaw, and chin remain measured editable geometry instead of a generic ellipse.
 */
export class StableFaceShape2D {
	static build(kind, data = {}, colors = {}, metrics = {}, view = {}) {
		const style = data.faceStyle || {};
		const radiusX = metrics.headRX * Number(style.widthScale || 1);
		const radiusY = metrics.headRY * Number(style.heightScale || 1);
		const cheek = Number(style.cheekScale || 1);
		const jaw = Number(style.jawScale || 0.72);
		const chin = Number(style.chinScale || 0.38);
		const top = metrics.headY - radiusY;
		const bottom = metrics.headY + radiusY;
		const dir = view.dir || 1;
		const asymmetry = view.type === 'threeQuarter' ? dir * radiusX * 0.08 : 0;
		return G.path(`${kind}_authored_head`, [
			{ type: 'move', x: asymmetry, y: top },
			{ type: 'quad', cx: radiusX * 0.84 + asymmetry, cy: top + radiusY * 0.08, x: radiusX, y: metrics.headY - radiusY * 0.16 },
			{ type: 'quad', cx: radiusX * cheek, cy: metrics.headY + radiusY * 0.52, x: radiusX * jaw, y: bottom - radiusY * 0.12 },
			{ type: 'quad', cx: radiusX * chin, cy: bottom + radiusY * 0.08, x: 0, y: bottom },
			{ type: 'quad', cx: -radiusX * chin, cy: bottom + radiusY * 0.08, x: -radiusX * jaw, y: bottom - radiusY * 0.12 },
			{ type: 'quad', cx: -radiusX * cheek, cy: metrics.headY + radiusY * 0.52, x: -radiusX, y: metrics.headY - radiusY * 0.16 },
			{ type: 'quad', cx: -radiusX * 0.84 + asymmetry, cy: top + radiusY * 0.08, x: asymmetry, y: top }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: Number(style.lineWidth || 3.4),
			lineJoin: 'round'
		});
	}
}
