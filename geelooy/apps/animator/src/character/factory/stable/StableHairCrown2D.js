// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableHeadWrapBack2D } from './StableHeadWrapBack2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Crown hair follows the skull instead of becoming a square forehead panel. The
 * Awtsmoos renews every root and cloth fold, while Awtsmoos.com keeps male hair
 * and Miriam's rear wrap layered inside one editable production character.
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
			G.path('natural_male_crown', this.crownCommands(geometry), {
				fill: colors.hair,
				stroke: colors.hairDark,
				lineWidth: Number(style.crownLineWidth || 1.25),
				lineJoin: 'round'
			}),
			this.temple('male_temple_left', -1, colors, shell, style),
			this.temple('male_temple_right', 1, colors, shell, style)
		]);
	}

	static geometry(shell, style) {
		const radiusX = shell.radiusX * Number(style.crownWidth || 0.96);
		const radiusY = shell.radiusY;
		return {
			x: shell.centerX + shell.turn * 0.4 + Number(style.crownOffsetX || 0),
			radiusX,
			topY: shell.centerY - radiusY * Number(style.crownBackDepth ?? 0.99),
			leftY: shell.centerY - radiusY * Number(style.leftTempleDepth ?? 0.1),
			rightY: shell.centerY - radiusY * Number(style.rightTempleDepth ?? 0.13),
			innerY: shell.centerY - radiusY * Number(style.crownInnerDepth ?? 0.48),
			asymmetry: radiusX * Number(style.crownAsymmetry || 0)
		};
	}

	static crownCommands(geometry) {
		const { x, radiusX, topY, leftY, rightY, innerY, asymmetry } = geometry;
		return [
			{ type: 'move', x: x - radiusX, y: leftY },
			{ type: 'bezier', c1x: x - radiusX * 0.9, c1y: topY + 10, c2x: x - radiusX * 0.4 + asymmetry, c2y: topY, x: x + asymmetry, y: topY },
			{ type: 'bezier', c1x: x + radiusX * 0.42 + asymmetry, c1y: topY - 1, c2x: x + radiusX * 0.92, c2y: topY + 11, x: x + radiusX, y: rightY },
			{ type: 'quad', cx: x + radiusX * 0.76, cy: innerY + 1, x: x + radiusX * 0.42, y: innerY + 3 },
			{ type: 'quad', cx: x + radiusX * 0.12, cy: innerY - 1, x: x - radiusX * 0.16, y: innerY + 2 },
			{ type: 'quad', cx: x - radiusX * 0.55, cy: innerY + 5, x: x - radiusX, y: leftY },
			{ type: 'close' }
		];
	}

	static temple(id, side, colors, shell, style) {
		const x = shell.centerX + side * shell.radiusX * Number(style.templeXScale ?? 0.95);
		return G.path(id, [
			{ type: 'move', x, y: shell.centerY - shell.radiusY * 0.42 },
			{ type: 'bezier', c1x: x + side * 1.5, c1y: shell.centerY - shell.radiusY * 0.15, c2x: x, c2y: shell.centerY + shell.radiusY * 0.03, x: x - side * 1.4, y: shell.centerY + shell.radiusY * 0.17 }
		], {
			stroke: colors.hairDark,
			lineWidth: Number(style.templeWidth || 2.5),
			lineCap: 'round'
		});
	}
}
