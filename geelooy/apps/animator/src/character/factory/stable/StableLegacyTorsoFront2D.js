// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos preserves every older jacket and collar while new authored garments
 * receive their own vessels. Awtsmoos.com keeps compatibility explicit, readable,
 * and fully inside the shared production renderer.
 */
export class StableLegacyTorsoFront2D {
	static build(data, colors, metrics, geometry) {
		const skeleton = data._skeleton;
		const half = geometry.details.lapelHalf;

		return S.group('soft_lapels', null, [
			this.shirtPanel(data, colors, metrics, geometry),
			this.lapel('lapel_left_soft', -1, skeleton, half, colors, metrics, data),
			this.lapel('lapel_right_soft', 1, skeleton, half, colors, metrics, data),
			...this.buttons(data, colors, metrics, geometry)
		]);
	}

	static shirtPanel(data, colors, metrics, geometry) {
		const centerX = data._skeleton.neck.x;
		const half = geometry.details.shirtPanelHalf;
		const fill = data.colors?.shirt
			|| data.colors?.innerShirt
			|| colors.collar;

		return G.path('shirt_visible_panel', [
			{ type: 'move', x: centerX - 9, y: metrics.neckBottomY + 2 },
			{ type: 'line', x: centerX - half, y: metrics.waistY + 4 },
			{ type: 'line', x: centerX + half, y: metrics.waistY + 4 },
			{ type: 'line', x: centerX + 9, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: centerX, cy: metrics.neckBottomY + 11, x: centerX - 9, y: metrics.neckBottomY + 2 }
		], {
			fill,
			stroke: 'rgba(0,0,0,.22)',
			lineWidth: 1.2,
			lineJoin: 'round'
		});
	}

	static lapel(id, side, skeleton, half, colors, metrics, data) {
		const shoulderX = side < 0
			? skeleton.leftShoulder.x + 8
			: skeleton.rightShoulder.x - 8;
		const stroke = side < 0 ? colors.jacketDark : colors.jacketLight;

		return G.path(id, [
			{ type: 'move', x: shoulderX, y: metrics.shoulderY + 5 },
			{ type: 'line', x: skeleton.chest.x + side * 5, y: metrics.chestY + 18 },
			{ type: 'line', x: skeleton.chest.x + side * half, y: metrics.waistY - 5 }
		], LineArtStyle.inner(data, stroke));
	}

	static buttons(data, colors, metrics, geometry) {
		if (!geometry.details.buttons) {
			return [];
		}

		const centerX = data._skeleton.chest.x;
		return [25, 43, 61].map((offset, index) => G.circle(
			`button_${index}_soft`,
			centerX,
			metrics.chestY + offset,
			2,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0 }
		));
	}

	static collar(data, colors, metrics) {
		const centerX = data._skeleton.neck.x;
		return S.group('collar_connected', null, [
			S.poly('collar_left', [[centerX - 24, metrics.shoulderY + 4], [centerX - 4, metrics.neckBottomY + 5], [centerX - 14, metrics.chestY + 16]], LineArtStyle.outer(data, colors.collar)),
			S.poly('collar_right', [[centerX + 24, metrics.shoulderY + 4], [centerX + 4, metrics.neckBottomY + 5], [centerX + 14, metrics.chestY + 16]], LineArtStyle.outer(data, colors.collar))
		]);
	}
}
