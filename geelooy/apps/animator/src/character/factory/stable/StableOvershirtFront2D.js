// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketFront2D } from './StablePocketFront2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's olive fronts rise around the neck and curve around one tapered inner top.
 * The Awtsmoos renews layered cloth without dark rails; Awtsmoos.com keeps collar,
 * opening, pocket, persistence, preview, and exact production export editable.
 */
export class StableOvershirtFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = Number(geometry.torso.waistCenterX);
		const inner = data.colors?.innerShirt || data.colors?.shirt || '#272729';
		return S.group('authored_olive_overshirt_front', null, [
			this.innerPanel(data, centerX, inner, metrics, geometry),
			...this.collars(data, centerX, colors, metrics, geometry),
			this.frontEdge(data, 'overshirt_left_front', -1, centerX, colors, metrics, geometry),
			this.frontEdge(data, 'overshirt_right_front', 1, centerX, colors, metrics, geometry),
			this.hem(data, centerX, colors, geometry),
			StablePocketFront2D.build(data, colors, metrics, geometry)
		]);
	}

	static innerPanel(data, centerX, fill, metrics, geometry) {
		const half = Number(geometry.details.shirtPanelHalf || 12);
		const bottomHalf = half * 0.74;
		const topY = this.topY(metrics, geometry);
		return G.path('overshirt_black_inner_panel', [
			{ type: 'move', x: centerX - half * 0.46, y: topY },
			{
				type: 'bezier',
				c1x: centerX - half * 0.9,
				c1y: metrics.chestY + 9,
				c2x: centerX - bottomHalf,
				c2y: geometry.torso.hemY - 11,
				x: centerX - bottomHalf,
				y: geometry.torso.hemY + 1
			},
			{
				type: 'quad',
				cx: centerX,
				cy: geometry.torso.hemY + 3.5,
				x: centerX + bottomHalf,
				y: geometry.torso.hemY + 1
			},
			{
				type: 'bezier',
				c1x: centerX + bottomHalf,
				c1y: geometry.torso.hemY - 11,
				c2x: centerX + half * 0.9,
				c2y: metrics.chestY + 9,
				x: centerX + half * 0.46,
				y: topY
			},
			{ type: 'close' }
		], LineArtStyle.medium(data, fill, 'rgba(0,0,0,0.14)'));
	}

	static collars(data, centerX, colors, metrics, geometry) {
		const spread = Number(geometry.details.collarSpread || 15);
		const drop = Number(geometry.details.collarDrop || 10);
		const topY = this.topY(metrics, geometry);
		return [-1, 1].map(side => G.path(`overshirt_soft_collar_${side}`, [
			{ type: 'move', x: centerX + side * 2.5, y: topY },
			{
				type: 'quad',
				cx: centerX + side * spread * 0.65,
				cy: topY + 1,
				x: centerX + side * spread,
				y: topY + 5
			},
			{
				type: 'quad',
				cx: centerX + side * (spread - 2),
				cy: topY + drop + 2,
				x: centerX + side * 6.5,
				y: topY + drop + 5
			},
			{ type: 'quad', cx: centerX + side * 4, cy: topY + 8, x: centerX + side * 2.5, y: topY },
			{ type: 'close' }
		], LineArtStyle.medium(data, side < 0 ? colors.jacketDark : colors.jacketLight)));
	}

	static frontEdge(data, id, side, centerX, colors, metrics, geometry) {
		const chest = Number(geometry.details.shirtPanelHalf || 12);
		const hem = Number(geometry.torso.hipHalf || 36) * 0.47;
		return G.path(id, [
			{ type: 'move', x: centerX + side * 6, y: this.topY(metrics, geometry) + 2 },
			{
				type: 'bezier',
				c1x: centerX + side * chest * 0.72,
				c1y: metrics.chestY + 8,
				c2x: centerX + side * chest,
				c2y: metrics.waistY - 8,
				x: centerX + side * hem,
				y: geometry.torso.hemY
			}
		], LineArtStyle.seam(data, side < 0 ? colors.jacketDark : colors.jacketLight));
	}

	static hem(data, centerX, colors, geometry) {
		const half = Number(geometry.torso.hipHalf || 36) * 0.78;
		return G.path('overshirt_weighted_hem', [
			{ type: 'move', x: centerX - half, y: geometry.torso.hemY - 1 },
			{ type: 'quad', cx: centerX, cy: geometry.torso.hemY + 4, x: centerX + half, y: geometry.torso.hemY }
		], LineArtStyle.interior(data, colors.jacketDark));
	}

	static topY(metrics, geometry) {
		return metrics.neckBottomY + 4 - Number(geometry.details.collarNeckRise || 0);
	}
}
