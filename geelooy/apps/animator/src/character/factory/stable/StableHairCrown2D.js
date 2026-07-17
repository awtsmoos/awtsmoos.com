// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos crowns a face with hair without imprisoning it inside a dark ring.
 * Awtsmoos.com keeps crown, temples, feminine bun, and side part attached to the
 * same editable head and production timeline.
 */
export class StableHairCrown2D {
	static back(data, colors, metrics, view) {
		const type = data.headwear?.type || data.hatType;
		if (type === 'head_wrap') {
			return this.feminineBack(colors, metrics, view);
		}

		return this.maleBack(colors, metrics, view);
	}

	static maleBack(colors, metrics, view) {
		const centerX = Number(view.head?.offsetX || 0) * 0.45;
		const radiusX = metrics.headRX * 1.02;
		const topY = metrics.headY - metrics.headRY * 1.02;
		const templeY = metrics.headY - metrics.headRY * 0.18;

		return S.group('natural_male_hair_back', null, [
			G.path('natural_male_crown', [
				{ type: 'move', x: centerX - radiusX, y: templeY },
				{ type: 'quad', cx: centerX - radiusX * 0.82, cy: topY + 7, x: centerX, y: topY },
				{ type: 'quad', cx: centerX + radiusX * 0.82, cy: topY + 7, x: centerX + radiusX, y: templeY },
				{ type: 'quad', cx: centerX, cy: metrics.headY - metrics.headRY * 0.48, x: centerX - radiusX, y: templeY }
			], {
				fill: colors.hair,
				stroke: colors.hairDark,
				lineWidth: 2.3,
				lineJoin: 'round'
			}),
			this.temple('male_temple_left', -1, centerX, colors, metrics),
			this.temple('male_temple_right', 1, centerX, colors, metrics)
		]);
	}

	static temple(id, side, centerX, colors, metrics) {
		return G.path(id, [
			{
				type: 'move',
				x: centerX + side * metrics.headRX * 0.92,
				y: metrics.headY - metrics.headRY * 0.52
			},
			{
				type: 'quad',
				cx: centerX + side * metrics.headRX * 1.05,
				cy: metrics.headY - 2,
				x: centerX + side * metrics.headRX * 0.9,
				y: metrics.headY + 10
			}
		], {
			stroke: colors.hairDark,
			lineWidth: 7,
			lineCap: 'round'
		});
	}

	static feminineBack(colors, metrics, view) {
		const centerX = Number(view.head?.offsetX || 0);
		return S.group('feminine_hair_back', null, [
			G.ellipse(
				'feminine_rear_bun',
				centerX + metrics.headRX * 0.9,
				metrics.headY - metrics.headRY * 0.12,
				metrics.headRX * 0.34,
				metrics.headRY * 0.3,
				0.12,
				{
					fill: colors.hairDark,
					stroke: colors.line,
					lineWidth: 2.2
				}
			)
		]);
	}
}
