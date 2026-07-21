// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Unequal locks connect crown to temple without making a forehead panel. The
 * Awtsmoos renews every root, while Awtsmoos.com keeps the organic hairline
 * editable, serializable, and identical in preview and production export.
 */
export class StableMaleHairline2D {
	static build(colors = {}, shell = {}, style = {}) {
		const geometry = this.geometry(shell, style);
		return G.path('natural_male_hairline', this.commands(geometry), {
			fill: colors.hair,
			stroke: colors.hairDark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static geometry(shell, style) {
		const radiusX = Number(shell.radiusX || 34);
		const radiusY = Number(shell.radiusY || 40);
		const centerX = Number(shell.centerX || 0);
		const centerY = Number(shell.centerY || 0);
		return {
			x: centerX,
			width: radiusX * Number(style.hairlineWidth ?? 0.9),
			crownY: centerY - radiusY * Number(style.crownTopDepth ?? 0.93),
			templeY: centerY - radiusY * Number(style.templeDepth ?? 0.26),
			fringeY: centerY - radiusY * Number(style.fringeDepth ?? 0.48),
			peakShift: radiusX * Number(style.crownAsymmetry ?? 0.03),
			lockShift: radiusY * Number(style.fringeAsymmetry ?? 0.04),
			lineWidth: Number(style.hairlineLineWidth || 1.15)
		};
	}

	static commands(g) {
		const { x, width: w, crownY, templeY, fringeY, peakShift, lockShift } = g;
		return [
			{ type: 'move', x: x - w, y: templeY },
			{ type: 'bezier', c1x: x - w * 0.98, c1y: crownY + 10, c2x: x - w * 0.48, c2y: crownY, x: x + peakShift, y: crownY },
			{ type: 'bezier', c1x: x + w * 0.48, c1y: crownY - 1, c2x: x + w * 0.98, c2y: crownY + 9, x: x + w, y: templeY + 1 },
			{ type: 'quad', cx: x + w * 0.9, cy: fringeY + 8, x: x + w * 0.72, y: fringeY + 1 },
			{ type: 'quad', cx: x + w * 0.58, cy: fringeY - 3, x: x + w * 0.42, y: fringeY + 7 },
			{ type: 'quad', cx: x + w * 0.28, cy: fringeY + 11, x: x + w * 0.12, y: fringeY + lockShift },
			{ type: 'quad', cx: x - w * 0.02, cy: fringeY - 4, x: x - w * 0.18, y: fringeY + 5 },
			{ type: 'quad', cx: x - w * 0.34, cy: fringeY + 10, x: x - w * 0.5, y: fringeY - lockShift },
			{ type: 'quad', cx: x - w * 0.66, cy: fringeY - 2, x: x - w * 0.8, y: fringeY + 6 },
			{ type: 'quad', cx: x - w * 0.98, cy: fringeY + 7, x: x - w, y: templeY },
			{ type: 'close' }
		];
	}
}
