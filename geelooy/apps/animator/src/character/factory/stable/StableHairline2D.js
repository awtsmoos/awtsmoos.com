// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos reveals a natural hairline beneath kippah or wrap instead of a row
 * of forehead bars. Awtsmoos.com keeps scallop, side part, temple, and gentle sway
 * as vector vessels bound to the same animated and serializable head.
 */
export class StableHairline2D {
	static front(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return this.feminineFringe(colors, metrics, view);
		}
		return this.maleHairline(colors, metrics, view);
	}

	static maleHairline(colors, metrics, view) {
		const offset = Number(view.head?.offsetX || 0) * 0.25;
		const y = metrics.headY - metrics.headRY * 0.5;
		const width = metrics.headRX * 0.78;
		return G.path('natural_male_hairline', [
			{ type: 'move', x: -width + offset, y: y - 3 },
			{ type: 'quad', cx: -width * 0.58 + offset, cy: y - 10, x: -width * 0.26 + offset, y: y - 5 },
			{ type: 'quad', cx: -width * 0.08 + offset, cy: y - 13, x: width * 0.08 + offset, y: y - 5 },
			{ type: 'quad', cx: width * 0.28 + offset, cy: y - 12, x: width * 0.5 + offset, y: y - 4 },
			{ type: 'quad', cx: width * 0.72 + offset, cy: y - 8, x: width + offset, y: y - 2 },
			{ type: 'quad', cx: 0, cy: y - metrics.headRY * 0.64, x: -width + offset, y: y - 3 }
		], { fill: colors.hair, stroke: colors.hairDark, lineWidth: 2, lineJoin: 'round' });
	}

	static feminineFringe(colors, metrics, view) {
		const y = metrics.headY - metrics.headRY * 0.52;
		const offset = Number(view.head?.offsetX || 0);
		return S.group('feminine_side_part_fringe', null, [
			G.path('fringe_left', [
				{ type: 'move', x: offset - metrics.headRX * 0.42, y: y - 6 },
				{ type: 'quad', cx: offset - metrics.headRX * 0.56, cy: y + 6, x: offset - metrics.headRX * 0.62, y: y + 15 }
			], { stroke: colors.hair, lineWidth: 7, lineCap: 'round' }),
			G.path('fringe_part', [
				{ type: 'move', x: offset - metrics.headRX * 0.32, y: y - 8 },
				{ type: 'quad', cx: offset - 2, cy: y - 15, x: offset + metrics.headRX * 0.22, y: y - 5 }
			], { stroke: colors.hairDark, lineWidth: 4.5, lineCap: 'round' })
		]);
	}
}
