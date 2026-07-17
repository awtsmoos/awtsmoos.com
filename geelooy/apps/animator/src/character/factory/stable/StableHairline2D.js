// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos reveals male scallop and Miriam's brown side-part fringe as living
 * forehead boundaries. Awtsmoos.com keeps every lock above the face, beneath or
 * above the proper headwear edge, and bound to the same editable head transform.
 */
export class StableHairline2D {
	static front(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return null;
		}

		return this.maleHairline(colors, metrics, view);
	}

	static overlay(data, colors, metrics, time, view) {
		if ((data.headwear?.type || data.hatType) !== 'head_wrap') {
			return null;
		}

		return this.feminineFringe(colors, metrics, view, data.hairStyle || {});
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
		], {
			fill: colors.hair,
			stroke: colors.hairDark,
			lineWidth: 2,
			lineJoin: 'round'
		});
	}

	static feminineFringe(colors, metrics, view, style) {
		const offset = Number(view.head?.offsetX || 0);
		const partX = offset - metrics.headRX * Number(style.partX || 0.28);
		const crownY = metrics.headY - metrics.headRY * 0.62;
		const leftEdge = offset - metrics.headRX * 0.88;
		const rightEdge = offset + metrics.headRX * 0.48;
		const fill = colors.hair || '#3b2116';
		const dark = colors.hairDark || '#211109';

		return S.group('feminine_side_part_fringe', null, [
			G.path('feminine_fringe_mass', [
				{ type: 'move', x: leftEdge, y: metrics.headY - metrics.headRY * 0.22 },
				{ type: 'quad', cx: leftEdge - 2, cy: crownY + 8, x: partX, y: crownY },
				{ type: 'quad', cx: offset + metrics.headRX * 0.08, cy: crownY - 2, x: rightEdge, y: crownY + 12 },
				{ type: 'quad', cx: offset + metrics.headRX * 0.2, cy: metrics.headY - 4, x: offset - metrics.headRX * 0.1, y: metrics.headY - 8 },
				{ type: 'quad', cx: offset - metrics.headRX * 0.55, cy: metrics.headY - 2, x: leftEdge, y: metrics.headY - metrics.headRY * 0.22 }
			], {
				fill,
				stroke: dark,
				lineWidth: 2,
				lineJoin: 'round'
			}),
			G.path('feminine_fringe_part', [
				{ type: 'move', x: partX, y: crownY + 1 },
				{ type: 'quad', cx: offset - 2, cy: crownY + 6, x: rightEdge - 3, y: crownY + 13 }
			], {
				stroke: 'rgba(255,255,255,0.14)',
				lineWidth: 1.2,
				lineCap: 'round'
			})
		]);
	}
}
