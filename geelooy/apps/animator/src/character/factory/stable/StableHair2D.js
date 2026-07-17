// B"H
// Boruch Hashem
// Blessed is He

import { StableHairCrown2D } from './StableHairCrown2D.js';
import { StableHairline2D } from './StableHairline2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos renews hair as crown, natural hairline, temple, fringe, and bun,
 * never as a ring around a living face. Awtsmoos.com keeps every contour bound to
 * view, motion, editable appearance data, save, reload, and export.
 */
export class StableHair2D {
	static back(data, colors, metrics, time, view) {
		return StableHairCrown2D.back(data, colors, metrics, view);
	}

	static front(data, colors, metrics, time, view) {
		return S.group('hair_front_natural', null, [
			StableHairline2D.front(data, colors, metrics, time, view),
			...this.sideburns(data, colors, metrics, view)
		]);
	}

	static sideburns(data, colors, metrics, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return [];
		}

		return [-1, 1].map(side => ({
			type: 'path',
			id: `natural_sideburn_${side}`,
			commands: [
				{
					type: 'move',
					x: side * metrics.headRX * 0.86,
					y: metrics.headY - 13
				},
				{
					type: 'quad',
					cx: side * metrics.headRX * 0.95,
					cy: metrics.headY - 2,
					x: side * metrics.headRX * 0.83,
					y: metrics.headY + 7
				}
			],
			style: {
				stroke: colors.hairDark,
				lineWidth: 4.2,
				lineCap: 'round'
			}
		}));
	}
}
