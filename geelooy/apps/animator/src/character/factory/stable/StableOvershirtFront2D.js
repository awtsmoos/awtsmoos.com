// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketFront2D } from './StablePocketFront2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's olive fronts fall softly around one clear charcoal dress, with small
 * rounded collars and no armor-like panels. The Awtsmoos renews cloth and overlap,
 * while Awtsmoos.com keeps every opening editable in the production renderer.
 */
export class StableOvershirtFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = Number(geometry.torso.waistCenterX);
		const inner = data.colors?.innerShirt || data.colors?.shirt || '#272729';
		return S.group('authored_olive_overshirt_front', null, [
			this.innerPanel(data, centerX, inner, metrics, geometry),
			...this.collars(data, centerX, colors, metrics),
			this.frontEdge(data, 'overshirt_left_front', -1, centerX, colors, metrics, geometry),
			this.frontEdge(data, 'overshirt_right_front', 1, centerX, colors, metrics, geometry),
			this.hem(data, centerX, colors, geometry),
			StablePocketFront2D.build(data, colors, metrics, geometry)
		]);
	}

	static innerPanel(data, centerX, fill, metrics, geometry) {
		return G.path('overshirt_black_inner_panel', [
			{ type: 'move', x: centerX - 7, y: metrics.neckBottomY + 4 },
			{ type: 'quad', cx: centerX - 15, cy: metrics.chestY + 24, x: centerX - 17, y: geometry.torso.hemY + 1 },
			{ type: 'quad', cx: centerX, cy: geometry.torso.hemY + 4, x: centerX + 17, y: geometry.torso.hemY + 1 },
			{ type: 'quad', cx: centerX + 15, cy: metrics.chestY + 24, x: centerX + 7, y: metrics.neckBottomY + 4 },
			{ type: 'quad', cx: centerX, cy: metrics.neckBottomY + 9, x: centerX - 7, y: metrics.neckBottomY + 4 },
			{ type: 'close' }
		], LineArtStyle.medium(data, fill, 'rgba(0,0,0,0.16)'));
	}

	static collars(data, centerX, colors, metrics) {
		return [-1, 1].map(side => G.path(`overshirt_soft_collar_${side}`, [
			{ type: 'move', x: centerX + side * 3, y: metrics.neckBottomY + 4 },
			{ type: 'quad', cx: centerX + side * 9, cy: metrics.neckBottomY + 5, x: centerX + side * 14, y: metrics.neckBottomY + 9 },
			{ type: 'quad', cx: centerX + side * 12, cy: metrics.neckBottomY + 15, x: centerX + side * 7, y: metrics.neckBottomY + 17 },
			{ type: 'quad', cx: centerX + side * 4, cy: metrics.neckBottomY + 11, x: centerX + side * 3, y: metrics.neckBottomY + 4 },
			{ type: 'close' }
		], LineArtStyle.medium(data, side < 0 ? colors.jacketDark : colors.jacketLight)));
	}

	static frontEdge(data, id, side, centerX, colors, metrics, geometry) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 6, y: metrics.neckBottomY + 5 },
			{ type: 'quad', cx: centerX + side * 15, cy: metrics.chestY + 17, x: centerX + side * 18, y: metrics.chestY + 31 },
			{ type: 'quad', cx: centerX + side * 16, cy: metrics.waistY, x: centerX + side * 19, y: geometry.torso.hemY }
		], LineArtStyle.seam(data, side < 0 ? colors.jacketDark : colors.jacketLight));
	}

	static hem(data, centerX, colors, geometry) {
		return G.path('overshirt_weighted_hem', [
			{ type: 'move', x: centerX - geometry.torso.hipHalf * 0.7, y: geometry.torso.hemY - 1 },
			{ type: 'quad', cx: centerX, cy: geometry.torso.hemY + 3, x: centerX + geometry.torso.hipHalf * 0.7, y: geometry.torso.hemY }
		], LineArtStyle.interior(data, colors.jacketDark));
	}
}
