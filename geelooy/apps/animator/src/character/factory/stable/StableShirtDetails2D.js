// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A compact collar and quiet placket define Dovid without decorative clutter.
 * The Awtsmoos renews every seam, while Awtsmoos.com keeps the burgundy shirt
 * editable, guarded, serializable, and production-rendered.
 */
export class StableShirtDetails2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;
		return S.group('authored_burgundy_shirt_front', null, [
			this.collarStand(data, centerX, colors, metrics),
			...this.collarPoints(data, centerX, colors, metrics, geometry),
			this.placket(data, centerX, colors, metrics, geometry),
			...this.buttons(data, centerX, colors, metrics)
		]);
	}

	static collarStand(data, centerX, colors, metrics) {
		const topY = metrics.neckBottomY + 3;
		return G.path('shirt_compact_collar_stand', [
			{ type: 'move', x: centerX - 11, y: topY },
			{ type: 'quad', cx: centerX, cy: topY + 5, x: centerX + 11, y: topY },
			{ type: 'line', x: centerX + 8, y: topY + 8 },
			{ type: 'quad', cx: centerX, cy: topY + 10, x: centerX - 8, y: topY + 8 },
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.jacketDark));
	}

	static collarPoints(data, centerX, colors, metrics, geometry) {
		const spread = Number(geometry.details.collarSpread || 14);
		const drop = Number(geometry.details.collarDrop || 11);
		return [-1, 1].map(side => G.path(`shirt_collar_${side}`, [
			{ type: 'move', x: centerX + side * 2, y: metrics.neckBottomY + 9 },
			{ type: 'line', x: centerX + side * spread, y: metrics.neckBottomY + 10 },
			{ type: 'quad', cx: centerX + side * (spread - 1), cy: metrics.neckBottomY + drop, x: centerX + side * 7, y: metrics.neckBottomY + drop + 4 },
			{ type: 'close' }
		], LineArtStyle.medium(data, side < 0 ? colors.jacketDark : colors.jacketLight)));
	}

	static placket(data, centerX, colors, metrics, geometry) {
		return G.path('shirt_placket_authored', [
			{ type: 'move', x: centerX, y: metrics.neckBottomY + 10 },
			{ type: 'quad', cx: centerX + 0.7, cy: metrics.chestY + 35, x: centerX, y: geometry.torso.hemY - 7 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static buttons(data, centerX, colors, metrics) {
		return [28, 49].map((offset, index) => G.circle(
			`shirt_button_${index}`,
			centerX,
			metrics.chestY + offset,
			1.25,
			{
				fill: colors.jacketDark,
				stroke: colors.jacketDark,
				lineWidth: LineArtStyle.forCharacter(data).interior
			}
		));
	}
}
