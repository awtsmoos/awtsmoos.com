// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A style-aware neck rises beneath the jaw and disappears into the garment collar.
 * The Awtsmoos joins head and body without air; Awtsmoos.com keeps this finite bridge
 * editable, persistent, preview-safe, and identical in exact production export.
 */
export class StableSitcomNeck2D {
	static build(data, colors, metrics) {
		const style = data.neckStyle || {};
		const centerX = data._skeleton.neck.x;
		const rawTop = Math.min(metrics.neckTopY, metrics.neckBottomY) + 3;
		const rawBottom = Math.max(metrics.neckTopY, metrics.neckBottomY) + 1;
		const bottomY = rawBottom - this.number(style.bottomCover, 0);
		const visibleHeight = this.number(style.visibleHeight, bottomY - rawTop);
		const topY = Math.min(rawTop, bottomY - visibleHeight);
		const topHalf = this.number(style.topHalf, 5.2);
		const bottomHalf = this.number(style.bottomHalf, 7.2);
		const line = LineArtStyle.forCharacter(data);
		const contour = {
			stroke: line.stroke,
			lineWidth: line.medium,
			lineCap: 'round',
			lineJoin: 'round'
		};
		return S.group('neck_connected', null, [
			G.path('neck_skin_mass', [
				{ type: 'move', x: centerX - topHalf, y: topY },
				{
					type: 'quad',
					cx: centerX - bottomHalf,
					cy: bottomY - 3,
					x: centerX - bottomHalf,
					y: bottomY
				},
				{ type: 'line', x: centerX + bottomHalf, y: bottomY },
				{
					type: 'quad',
					cx: centerX + bottomHalf,
					cy: bottomY - 3,
					x: centerX + topHalf,
					y: topY
				},
				{ type: 'close' }
			], { fill: colors.skin }),
			this.side(
				'neck_left_contour', -1, centerX,
				topY, bottomY, topHalf, bottomHalf, contour
			),
			this.side(
				'neck_right_contour', 1, centerX,
				topY, bottomY, topHalf, bottomHalf, contour
			)
		]);
	}

	static side(id, side, centerX, topY, bottomY, topHalf, bottomHalf, style) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * topHalf, y: topY + 1 },
			{
				type: 'quad',
				cx: centerX + side * bottomHalf,
				cy: bottomY - 3,
				x: centerX + side * bottomHalf,
				y: bottomY - 1
			}
		], style);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
