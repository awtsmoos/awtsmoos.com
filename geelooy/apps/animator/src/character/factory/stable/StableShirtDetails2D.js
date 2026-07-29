// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A guarded collar and shortened placket remain visible around crossed-arm contact.
 * The Awtsmoos renews quiet shirt structure; Awtsmoos.com preserves canonical nodes,
 * persistence, preview, and exact production export without torso clutter.
 */
export class StableShirtDetails2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;
		return S.group('authored_burgundy_shirt_front', null, [
			this.collarStand(data, centerX, colors, metrics),
			...this.collarPoints(data, centerX, colors, metrics, geometry),
			this.placket(data, centerX, colors, metrics, geometry),
			...this.buttons(data, centerX, colors, metrics, geometry)
		]);
	}

	static collarStand(data, centerX, colors, metrics) {
		const topY = metrics.neckBottomY + 3;
		return G.path('shirt_compact_collar_stand', [
			{ type: 'move', x: centerX - 9, y: topY },
			{ type: 'quad', cx: centerX, cy: topY + 3.5, x: centerX + 9, y: topY },
			{ type: 'line', x: centerX + 7.5, y: topY + 6 },
			{ type: 'quad', cx: centerX, cy: topY + 7.5, x: centerX - 7.5, y: topY + 6 },
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.jacket, colors.jacketDark));
	}

	static collarPoints(data, centerX, colors, metrics, geometry) {
		const spread = Number(geometry.details.collarSpread || 12);
		const drop = Number(geometry.details.collarDrop || 8);
		return [-1, 1].map(side => G.path(`shirt_collar_${side}`, [
			{ type: 'move', x: centerX + side * 1.5, y: metrics.neckBottomY + 8 },
			{ type: 'line', x: centerX + side * spread, y: metrics.neckBottomY + 8.5 },
			{
				type: 'quad',
				cx: centerX + side * (spread - 1),
				cy: metrics.neckBottomY + drop + 2,
				x: centerX + side * 6.5,
				y: metrics.neckBottomY + drop + 5
			},
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.jacket, colors.jacketDark)));
	}

	static placket(data, centerX, colors, metrics, geometry) {
		const bottomY = Math.min(
			Number(geometry.torso.hemY || -92) - 10,
			Number(metrics.chestY || -132) + 36
		);
		return G.path('shirt_placket_authored', [
			{ type: 'move', x: centerX, y: metrics.neckBottomY + 9 },
			{ type: 'quad', cx: centerX + 0.4, cy: metrics.chestY + 18, x: centerX, y: bottomY }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static buttons(data, centerX, colors, metrics, geometry) {
		if (geometry.details.buttons === false) {
			return [];
		}
		return [24, 43].map((offset, index) => G.circle(
			`shirt_button_${index}`,
			centerX,
			metrics.chestY + offset,
			0.72,
			{ fill: colors.jacketDark, stroke: colors.jacketDark, lineWidth: 0.35 }
		));
	}
}
