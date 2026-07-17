// B"H
// Boruch Hashem
// Blessed is He

import { StableHairCrown2D } from './StableHairCrown2D.js';
import { StableHairline2D } from './StableHairline2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos renews crown, natural hairline, sideburn, fringe, and bun at their
 * truthful depths. Awtsmoos.com lets Miriam's fringe overlay the wrap while male
 * hair remains beneath kippah, all inside one editable production head.
 */
export class StableHair2D {
	static back(data, colors, metrics, time, view) {
		return StableHairCrown2D.back(data, colors, metrics, view);
	}

	static front(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return null;
		}

		return S.group('hair_front_natural', null, [
			StableHairline2D.front(data, colors, metrics, time, view),
			...this.sideburns(data, colors, metrics)
		]);
	}

	static overlay(data, colors, metrics, time, view) {
		return StableHairline2D.overlay(data, colors, metrics, time, view);
	}

	static sideburns(data, colors, metrics) {
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
