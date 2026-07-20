// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Hairline and fringe descend from the shared crown instead of a smaller ghost
 * skull. The Awtsmoos joins every lock, while Awtsmoos.com keeps the original
 * vectors editable, serializable, animated, and production-bound.
 */
export class StableHairline2D {
	static front(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return null;
		}
		return this.maleHairline(
			colors,
			StableHeadShellGeometry.resolve(data, metrics, view)
		);
	}

	static overlay(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) !== 'head_wrap') {
			return null;
		}
		return this.feminineFringe(
			colors,
			StableHeadShellGeometry.resolve(data, metrics, view),
			data.hairStyle || {}
		);
	}

	static maleHairline(colors, shell) {
		const x = shell.centerX;
		const y = shell.centerY - shell.radiusY * 0.48;
		const width = shell.radiusX * 0.82;
		return G.path('natural_male_hairline', [
			{ type: 'move', x: x - width, y: y - 2 },
			{ type: 'quad', cx: x - width * 0.58, cy: y - shell.radiusY * 0.15, x: x - width * 0.27, y: y - 5 },
			{ type: 'quad', cx: x - width * 0.08, cy: y - shell.radiusY * 0.18, x: x + width * 0.08, y: y - 4 },
			{ type: 'quad', cx: x + width * 0.3, cy: y - shell.radiusY * 0.16, x: x + width * 0.5, y: y - 3 },
			{ type: 'quad', cx: x + width * 0.74, cy: y - shell.radiusY * 0.1, x: x + width, y },
			{ type: 'quad', cx: x, cy: shell.centerY - shell.radiusY * 1.04, x: x - width, y: y - 2 }
		], {
			fill: colors.hair,
			stroke: colors.hairDark,
			lineWidth: 2,
			lineJoin: 'round'
		});
	}

	static feminineFringe(colors, shell, style) {
		const x = shell.centerX;
		const partX = x - shell.radiusX * Number(style.partX || 0.28);
		const crownY = shell.centerY - shell.radiusY * 0.76;
		const left = x - shell.radiusX * 0.88;
		const right = x + shell.radiusX * 0.48;
		return S.group('feminine_side_part_fringe', null, [
			G.path('feminine_fringe_mass', [
				{ type: 'move', x: left, y: shell.centerY - shell.radiusY * 0.12 },
				{ type: 'quad', cx: left - 2, cy: crownY + 8, x: partX, y: crownY },
				{ type: 'quad', cx: x + shell.radiusX * 0.08, cy: crownY - 2, x: right, y: crownY + 10 },
				{ type: 'quad', cx: x + shell.radiusX * 0.22, cy: shell.centerY - shell.radiusY * 0.08, x: x - shell.radiusX * 0.08, y: shell.centerY - shell.radiusY * 0.04 },
				{ type: 'quad', cx: x - shell.radiusX * 0.58, cy: shell.centerY, x: left, y: shell.centerY - shell.radiusY * 0.12 }
			], {
				fill: colors.hair || '#3b2116',
				stroke: colors.hairDark || '#211109',
				lineWidth: 2,
				lineJoin: 'round'
			}),
			G.path('feminine_fringe_part', [
				{ type: 'move', x: partX, y: crownY + 1 },
				{ type: 'quad', cx: x - 2, cy: crownY + 5, x: right - 3, y: crownY + 11 }
			], { stroke: 'rgba(255,255,255,0.14)', lineWidth: 1.2, lineCap: 'round' })
		]);
	}
}
