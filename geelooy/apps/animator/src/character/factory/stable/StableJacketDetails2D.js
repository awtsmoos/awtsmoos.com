// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Ari's broad white shirt rests inside compact lapels and a softly weighted hem.
 * The Awtsmoos renews every finite overlap, while Awtsmoos.com keeps interior
 * marks quieter than the rounded navy silhouette in preview and export.
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
		const line = LineArtStyle.forCharacter(data);
		return G.path('jacket_white_shirt_panel', [
			{ type: 'move', x: centerX - 11, y: topY },
			{ type: 'quad', cx: centerX - half, cy: metrics.chestY + 22, x: centerX - half, y: bottomY },
			{ type: 'quad', cx: centerX, cy: bottomY + 2, x: centerX + half, y: bottomY },
			{ type: 'quad', cx: centerX + half, cy: metrics.chestY + 22, x: centerX + 11, y: topY },
			{ type: 'quad', cx: centerX, cy: topY + 9, x: centerX - 11, y: topY }
		], {
			fill,
			stroke: line.softStroke,
			lineWidth: line.seam,
			lineJoin: 'round'
		});
	}

	static collar(data, centerX, fill, colors, metrics) {
		const topY = metrics.neckBottomY + 1;
		return [-1, 1].map(side => G.path(`jacket_shirt_collar_${side}`, [
			{ type: 'move', x: centerX + side * 1.5, y: topY + 8 },
			{ type: 'line', x: centerX + side * 10.5, y: topY + 0.5 },
			{ type: 'quad', cx: centerX + side * 12, cy: topY + 6, x: centerX + side * 7, y: topY + 12.5 },
			{ type: 'close' }
		], LineArtStyle.medium(data, fill, colors.line)));
	}

	static lapel(data, id, side, centerX, colors, metrics, geometry) {
		const reach = Number(geometry.details.lapelHalf || 6);
		const topY = metrics.neckBottomY + 3;
		return G.path(id, [
			{ type: 'move', x: centerX + side * 10, y: topY },
			{ type: 'quad', cx: centerX + side * (reach + 5), cy: metrics.chestY + 5, x: centerX + side * (reach + 7), y: metrics.chestY + 13 },
			{ type: 'quad', cx: centerX + side * (reach + 2), cy: metrics.chestY + 18, x: centerX + side * 10.5, y: metrics.chestY + 19 },
			{ type: 'quad', cx: centerX + side * 8, cy: metrics.chestY + 11, x: centerX + side * 10, y: topY }
		], LineArtStyle.medium(data, colors.jacket, colors.jacketDark));
	}

	static hemWeight(data, centerX, colors, geometry) {
		return G.path('jacket_weighted_hem', [
			{ type: 'move', x: centerX - geometry.torso.hipHalf * 0.76, y: geometry.torso.hemY - 2.5 },
			{ type: 'quad', cx: centerX - 1, cy: geometry.torso.hemY + 2.5, x: centerX + geometry.torso.hipHalf * 0.76, y: geometry.torso.hemY - 2 }
		], LineArtStyle.interior(data, colors.jacketDark));
	}

	static buttons(data, centerX, colors, metrics, geometry) {
		if (!geometry.details.buttons) return [];
		return [28, 47, 65].map((offset, index) => G.circle(
			`jacket_button_${index}`,
			centerX + 1,
			metrics.chestY + offset,
			0.85,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0.4 }
		));
	}
}
