// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A shallow band of unequal locks reveals the forehead beneath living crown
 * hair. The Awtsmoos renews every scallop, while Awtsmoos.com keeps depth,
 * asymmetry, and line hierarchy editable in the production character.
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
		const x = Number(shell.centerX || 0);
		const centerY = Number(shell.centerY || 0);
		return {
			x,
			width: radiusX * Number(style.hairlineWidth ?? 0.88),
			upperY: centerY - radiusY * Number(style.hairlineTopDepth ?? 0.72),
			templeY: centerY - radiusY * Number(style.templeDepth ?? 0.34),
			fringeY: centerY - radiusY * Number(style.fringeDepth ?? 0.5),
			asymmetry: radiusY * Number(style.fringeAsymmetry ?? 0.04),
			lineWidth: Number(style.hairlineLineWidth || 1.2)
		};
	}

	static commands(geometry) {
		const { x, width, upperY, templeY, fringeY, asymmetry } = geometry;
		return [
			{ type: 'move', x: x - width * 0.96, y: upperY + 2 },
			{ type: 'bezier', c1x: x - width * 0.52, c1y: upperY - 3, c2x: x + width * 0.5, c2y: upperY - 2, x: x + width * 0.96, y: upperY + 2 },
			{ type: 'quad', cx: x + width, cy: templeY - 2, x: x + width * 0.82, y: templeY },
			{ type: 'quad', cx: x + width * 0.7, cy: fringeY + 6, x: x + width * 0.54, y: fringeY },
			{ type: 'quad', cx: x + width * 0.42, cy: fringeY - 2, x: x + width * 0.28, y: fringeY + 7 },
			{ type: 'quad', cx: x + width * 0.12, cy: fringeY + 1, x: x, y: fringeY + 4 + asymmetry },
			{ type: 'quad', cx: x - width * 0.12, cy: fringeY + 8, x: x - width * 0.26, y: fringeY - asymmetry },
			{ type: 'quad', cx: x - width * 0.42, cy: fringeY - 1, x: x - width * 0.56, y: fringeY + 6 },
			{ type: 'quad', cx: x - width * 0.72, cy: fringeY + 3, x: x - width * 0.84, y: templeY },
			{ type: 'quad', cx: x - width, cy: templeY - 2, x: x - width * 0.96, y: upperY + 2 },
			{ type: 'close' }
		];
	}
}
