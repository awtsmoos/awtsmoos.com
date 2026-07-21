// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Ari's broad white shirt rests inside small rolled lapels and a weighted hem.
 * The Awtsmoos renews every finite fold, while Awtsmoos.com keeps interior marks
 * quieter than the soft navy silhouette in preview, edit, save, and export.
 */
export class StableJacketDetails2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;
		const shirt = data.colors?.shirt || data.colors?.innerShirt || colors.collar;
		return S.group('authored_jacket_front', null, [
			this.shirtPanel(data, centerX, shirt, metrics, geometry),
			...this.collar(data, centerX, shirt, colors, metrics),
			this.lapel(data, 'jacket_lapel_left', -1, centerX, colors, metrics, geometry),
			this.lapel(data, 'jacket_lapel_right', 1, centerX, colors, metrics, geometry),
			this.hemWeight(data, centerX, colors, geometry),
			...this.buttons(data, centerX, colors, metrics, geometry)
		]);
	}

	static shirtPanel(data, centerX, fill, metrics, geometry) {
		const half = Number(geometry.details.shirtPanelHalf || 21);
		const topY = metrics.neckBottomY + 1;
		const bottomY = geometry.torso.hemY - 3;
		return G.path('jacket_white_shirt_panel', [
			{ type: 'move', x: centerX - 11, y: topY },
			{ type: 'quad', cx: centerX - half, cy: metrics.chestY + 22, x: centerX - half, y: bottomY },
			{ type: 'quad', cx: centerX, cy: bottomY + 3, x: centerX + half, y: bottomY },
			{ type: 'quad', cx: centerX + half, cy: metrics.chestY + 22, x: centerX + 11, y: topY },
			{ type: 'quad', cx: centerX, cy: topY + 10, x: centerX - 11, y: topY }
		], LineArtStyle.medium(data, fill, 'rgba(20,24,30,0.22)'));
	}

	static collar(data, centerX, fill, colors, metrics) {
		const topY = metrics.neckBottomY + 1;
		return [-1, 1].map(side => G.path(`jacket_shirt_collar_${side}`, [
			{ type: 'move', x: centerX + side * 2, y: topY + 9 },
			{ type: 'line', x: centerX + side * 11, y: topY },
			{ type: 'quad', cx: centerX + side * 13, cy: topY + 7, x: centerX + side * 8, y: topY + 14 },
			{ type: 'line', x: centerX + side * 2, y: topY + 9 }
		], LineArtStyle.medium(data, fill, colors.skinDark)));
	}

	static lapel(data, id, side, centerX, colors, metrics, geometry) {
		const reach = Number(geometry.details.lapelHalf || 8);
		const topY = metrics.neckBottomY + 3;
		return G.path(id, [
			{ type: 'move', x: centerX + side * 10, y: topY },
			{ type: 'quad', cx: centerX + side * (reach + 5), cy: metrics.chestY + 9, x: centerX + side * (reach + 8), y: metrics.chestY + 18 },
			{ type: 'quad', cx: centerX + side * (reach + 1), cy: metrics.chestY + 23, x: centerX + side * 12, y: metrics.chestY + 26 },
			{ type: 'quad', cx: centerX + side * 8, cy: metrics.chestY + 15, x: centerX + side * 10, y: topY }
		], LineArtStyle.medium(data, side < 0 ? colors.jacketDark : colors.jacketLight));
	}

	static hemWeight(data, centerX, colors, geometry) {
		return G.path('jacket_weighted_hem', [
			{ type: 'move', x: centerX - geometry.torso.hipHalf * 0.8, y: geometry.torso.hemY - 3 },
			{ type: 'quad', cx: centerX - 2, cy: geometry.torso.hemY + 4, x: centerX + geometry.torso.hipHalf * 0.8, y: geometry.torso.hemY - 2 }
		], LineArtStyle.interior(data, colors.jacketDark));
	}

	static buttons(data, centerX, colors, metrics, geometry) {
		if (!geometry.details.buttons) {
			return [];
		}
		return [47, 64].map((offset, index) => G.circle(
			`jacket_button_${index}`,
			centerX + 2,
			metrics.chestY + offset,
			1.2,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0.6 }
		));
	}
}
