// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketFront2D } from './StablePocketFront2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's olive fronts fall around one clear charcoal dress with rounded weight.
 * The Awtsmoos renews modest overlap without armor, while Awtsmoos.com keeps hem,
 * opening, and pocket editable in the authoritative production renderer.
 */
export class StableOvershirtFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = Number(geometry.torso.waistCenterX);
		const inner = data.colors?.innerShirt || data.colors?.shirt || '#272729';
		return S.group('authored_olive_overshirt_front', null, [
			this.innerPanel(data, centerX, inner, metrics, geometry),
			this.frontEdge(data, 'overshirt_left_front', -1, centerX, colors, metrics, geometry),
			this.frontEdge(data, 'overshirt_right_front', 1, centerX, colors, metrics, geometry),
			this.hem(data, centerX, colors, geometry),
			StablePocketFront2D.build(data, colors, metrics, geometry)
		]);
	}

	static innerPanel(data, centerX, fill, metrics, geometry) {
		return G.path('overshirt_black_inner_panel', [
			{ type: 'move', x: centerX - 8, y: metrics.neckBottomY + 4 },
			{ type: 'quad', cx: centerX - 16, cy: metrics.chestY + 24, x: centerX - 18, y: geometry.torso.hemY - 1 },
			{ type: 'quad', cx: centerX, cy: geometry.torso.hemY + 1, x: centerX + 18, y: geometry.torso.hemY - 1 },
			{ type: 'quad', cx: centerX + 16, cy: metrics.chestY + 24, x: centerX + 8, y: metrics.neckBottomY + 4 },
			{ type: 'quad', cx: centerX, cy: metrics.neckBottomY + 10, x: centerX - 8, y: metrics.neckBottomY + 4 }
		], LineArtStyle.medium(data, fill, 'rgba(0,0,0,0.18)'));
	}

	static frontEdge(data, id, side, centerX, colors, metrics, geometry) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 7, y: metrics.neckBottomY + 3 },
			{ type: 'quad', cx: centerX + side * 17, cy: metrics.chestY + 16, x: centerX + side * 19, y: metrics.chestY + 29 },
			{ type: 'quad', cx: centerX + side * 17, cy: metrics.waistY, x: centerX + side * 20, y: geometry.torso.hemY - 1 }
		], LineArtStyle.seam(data, side < 0 ? colors.jacketDark : colors.jacketLight));
	}

	static hem(data, centerX, colors, geometry) {
		return G.path('overshirt_weighted_hem', [
			{ type: 'move', x: centerX - geometry.torso.hipHalf * 0.72, y: geometry.torso.hemY - 2 },
			{ type: 'quad', cx: centerX, cy: geometry.torso.hemY + 3, x: centerX + geometry.torso.hipHalf * 0.72, y: geometry.torso.hemY - 1 }
		], LineArtStyle.interior(data, colors.jacketDark));
	}
}
