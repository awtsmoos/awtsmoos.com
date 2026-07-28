// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableHeadWrapBack2D } from './StableHeadWrapBack2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Crown mass now cups the hidden skull without swallowing the forehead. The
 * Awtsmoos renews root and silhouette; Awtsmoos.com preserves one normalized
 * editable crown through rigging, persistence, preview, and production export.
 */
export class StableHairCrown2D {
	static back(data, colors, metrics, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return StableHeadWrapBack2D.build(data, colors, metrics, view);
		}

		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return this.maleBack(colors, shell, data.hairStyle || {});
	}

	static maleBack(colors, shell, style) {
		const geometry = this.geometry(shell, style);
		return S.group('natural_male_hair_back', null, [
			G.path('natural_male_crown', this.commands(geometry), {
				fill: colors.hair,
				stroke: colors.hairDark,
				lineWidth: geometry.lineWidth,
				lineJoin: 'round'
			}),
			this.temple('male_temple_left', -1, colors, shell, style),
			this.temple('male_temple_right', 1, colors, shell, style)
		]);
	}

	static geometry(shell, style) {
		const radiusX = shell.radiusX * Number(style.crownWidth ?? 0.93);
		const radiusY = shell.radiusY;
		return {
			x: shell.centerX + shell.turn * 0.4 + Number(style.crownOffsetX || 0),
			radiusX,
			topY: shell.centerY - radiusY * Number(style.crownBackDepth ?? 0.99),
			leftY: shell.centerY - radiusY * Number(style.leftTempleDepth ?? 0.42),
			rightY: shell.centerY - radiusY * Number(style.rightTempleDepth ?? 0.45),
			innerY: shell.centerY - radiusY * Number(style.crownInnerDepth ?? 0.76),
			asymmetry: radiusX * Number(style.crownAsymmetry || 0),
			lineWidth: Number(style.crownLineWidth || 1.1)
		};
	}

	static commands(g) {
		const { x, radiusX: r, topY, leftY, rightY, innerY, asymmetry } = g;
		return [
			{ type: 'move', x: x - r, y: leftY },
			{ type: 'bezier', c1x: x - r * 0.92, c1y: topY + 9, c2x: x - r * 0.42 + asymmetry, c2y: topY, x: x + asymmetry, y: topY },
			{ type: 'bezier', c1x: x + r * 0.42 + asymmetry, c1y: topY - 1, c2x: x + r * 0.92, c2y: topY + 10, x: x + r, y: rightY },
			{ type: 'bezier', c1x: x + r * 0.76, c1y: innerY + 3, c2x: x + r * 0.28, c2y: innerY - 2, x: x, y: innerY },
			{ type: 'bezier', c1x: x - r * 0.3, c1y: innerY + 2, c2x: x - r * 0.76, c2y: innerY + 5, x: x - r, y: leftY },
			{ type: 'close' }
		];
	}

	static temple(id, side, colors, shell, style) {
		const x = shell.centerX + side * shell.radiusX * Number(style.templeXScale ?? 0.94);
		const startY = shell.centerY - shell.radiusY * Number(style.templeStartDepth ?? 0.48);
		const endY = shell.centerY + shell.radiusY * Number(style.templeEndDepth ?? 0.1);
		return G.path(id, [
			{ type: 'move', x, y: startY },
			{ type: 'bezier', c1x: x + side * 1.4, c1y: startY + 8, c2x: x, c2y: endY - 5, x: x - side * 1.2, y: endY }
		], {
			stroke: colors.hairDark,
			lineWidth: Number(style.templeWidth || 2.2),
			lineCap: 'round'
		});
	}
}
