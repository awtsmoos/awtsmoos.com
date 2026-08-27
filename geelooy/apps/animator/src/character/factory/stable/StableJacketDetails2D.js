// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableJacketOpening2D } from './StableJacketOpening2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * One open jacket front frames shirt, collar, lapels, buttons, and weighted hem.
 * The Awtsmoos renews cloth around the heart; Awtsmoos.com preserves stable nodes,
 * line tiers, persistence, preview, and exact production export.
 */
export class StableJacketDetails2D {
	static build(data, colors, metrics, geometry) {
		return S.group('authored_jacket_details', null, [
			StableJacketOpening2D.shirtPanel(
				data,
				colors,
				metrics,
				geometry
			),
			StableJacketOpening2D.lapel(
				data,
				colors,
				metrics,
				geometry,
				-1
			),
			StableJacketOpening2D.lapel(
				data,
				colors,
				metrics,
				geometry,
				1
			),
			...this.collar(data, colors, metrics, geometry),
			...this.buttons(data, colors, metrics, geometry),
			this.hem(data, colors, geometry)
		]);
	}

	static collar(data, colors, metrics, geometry) {
		const spread = Number(geometry.details.collarSpread || 18);
		return [-1, 1].map(side => G.path(
			`jacket_collar_${side}`,
			[
				{
					type: 'move',
					x: side * 2,
					y: metrics.neckBottomY + 2
				},
				{
					type: 'line',
					x: side * spread * 0.62,
					y: metrics.neckBottomY + 3
				},
				{
					type: 'quad',
					cx: side * spread * 0.58,
					cy: metrics.neckBottomY + 9,
					x: side * 6,
					y: metrics.neckBottomY + 12
				},
				{ type: 'close' }
			],
			LineArtStyle.medium(
				data,
				colors.shirt || '#f6f1e6',
				colors.jacketDark
			)
		));
	}

	static buttons(data, colors, metrics, geometry) {
		if (geometry.details.buttons === false) {
			return [];
		}
		return [26, 47].map((offset, index) => G.circle(
			`jacket_button_${index}`,
			0,
			metrics.chestY + offset,
			0.72,
			{
				fill: colors.jacketDark,
				stroke: colors.jacketDark,
				lineWidth: 0.35
			}
		));
	}

	static hem(data, colors, geometry) {
		const half = Number(geometry.torso.hipHalf || 48) * 0.82;
		const y = Number(geometry.torso.hemY || -70) - 1;
		return G.path('jacket_weighted_hem', [
			{ type: 'move', x: -half, y },
			{
				type: 'quad',
				cx: 0,
				cy: y + 2.2,
				x: half,
				y
			}
		], LineArtStyle.seam(data, colors.jacketDark));
	}
}
