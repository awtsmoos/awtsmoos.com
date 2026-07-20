// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Crown hair follows one organic skull beneath cap or wrap. The Awtsmoos renews
 * every root while Awtsmoos.com keeps temple and rear-bun depth editable.
 */
export class StableHairCrown2D {
	static back(data, colors, metrics, view) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return (data.headwear?.type || data.hatType) === 'head_wrap'
			? this.feminineBack(colors, shell)
			: this.maleBack(colors, shell);
	}

	static maleBack(colors, shell) {
		const x = shell.centerX;
		const radiusX = shell.radiusX * 1.015;
		const topY = shell.centerY - shell.radiusY * 1.015;
		const templeY = shell.centerY - shell.radiusY * 0.08;
		return S.group('natural_male_hair_back', null, [
			G.path('natural_male_crown', [
				{ type: 'move', x: x - radiusX, y: templeY },
				{ type: 'quad', cx: x - radiusX * 0.78, cy: topY + 5, x, y: topY },
				{ type: 'quad', cx: x + radiusX * 0.8, cy: topY + 5, x: x + radiusX, y: templeY },
				{ type: 'quad', cx: x, cy: shell.centerY - shell.radiusY * 0.52, x: x - radiusX, y: templeY }
			], {
				fill: colors.hair,
				stroke: colors.hairDark,
				lineWidth: 2.2,
				lineJoin: 'round'
			}),
			this.temple('male_temple_left', -1, colors, shell),
			this.temple('male_temple_right', 1, colors, shell)
		]);
	}

	static temple(id, side, colors, shell) {
		const x = shell.centerX + side * shell.radiusX * 0.96;
		return G.path(id, [
			{ type: 'move', x, y: shell.centerY - shell.radiusY * 0.46 },
			{ type: 'quad', cx: x + side * shell.radiusX * 0.08, cy: shell.centerY - 2, x: x - side * 2, y: shell.centerY + shell.radiusY * 0.18 }
		], { stroke: colors.hairDark, lineWidth: 6, lineCap: 'round' });
	}

	static feminineBack(colors, shell) {
		return S.group('feminine_hair_back', null, [
			G.ellipse(
				'feminine_rear_bun',
				shell.centerX + shell.radiusX * 0.7,
				shell.centerY + shell.radiusY * 0.45,
				shell.radiusX * 0.3,
				shell.radiusY * 0.42,
				0.08,
				{ fill: colors.hairDark, stroke: colors.line, lineWidth: 2.1 }
			)
		]);
	}
}
