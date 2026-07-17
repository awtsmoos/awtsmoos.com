// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed opens Ari's navy jacket around a clean white shirt without turning the
 * lapels into long triangles. The Awtsmoos renews every panel, while Awtsmoos.com
 * preserves buttons, pockets, opening, and collar as living vector geometry.
 */
export class StableJacketFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;
		const shirtHalf = geometry.details.shirtPanelHalf;
		const shirt = data.colors?.shirt
			|| data.colors?.innerShirt
			|| colors.collar;

		return S.group('authored_jacket_front', null, [
			this.shirtPanel(centerX, shirtHalf, shirt, metrics, geometry),
			this.lapel('jacket_lapel_left', -1, centerX, colors, metrics),
			this.lapel('jacket_lapel_right', 1, centerX, colors, metrics),
			...this.buttons(centerX, colors, metrics),
			this.pocket('jacket_pocket_left', -1, centerX, colors, metrics),
			this.pocket('jacket_pocket_right', 1, centerX, colors, metrics)
		]);
	}

	static shirtPanel(centerX, half, fill, metrics, geometry) {
		return G.path('jacket_white_shirt_panel', [
			{ type: 'move', x: centerX - 9, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: centerX - half, cy: metrics.chestY + 31, x: centerX - half, y: geometry.torso.hemY - 3 },
			{ type: 'line', x: centerX + half, y: geometry.torso.hemY - 3 },
			{ type: 'quad', cx: centerX + half, cy: metrics.chestY + 31, x: centerX + 9, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: centerX, cy: metrics.neckBottomY + 12, x: centerX - 9, y: metrics.neckBottomY + 2 }
		], {
			fill,
			stroke: 'rgba(0,0,0,.2)',
			lineWidth: 1.2,
			lineJoin: 'round'
		});
	}

	static lapel(id, side, centerX, colors, metrics) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 10, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: centerX + side * 22, cy: metrics.chestY + 8, x: centerX + side * 27, y: metrics.chestY + 22 },
			{ type: 'line', x: centerX + side * 15, y: metrics.chestY + 29 },
			{ type: 'quad', cx: centerX + side * 9, cy: metrics.chestY + 18, x: centerX + side * 10, y: metrics.neckBottomY + 2 }
		], {
			fill: side < 0 ? colors.jacketDark : colors.jacketLight,
			stroke: colors.line,
			lineWidth: 1.45,
			lineJoin: 'round'
		});
	}

	static buttons(centerX, colors, metrics) {
		return [33, 49, 65].map((offset, index) => G.circle(
			`jacket_button_${index}`,
			centerX + 3,
			metrics.chestY + offset,
			1.8,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0 }
		));
	}

	static pocket(id, side, centerX, colors, metrics) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 24, y: metrics.waistY + 7 },
			{ type: 'quad', cx: centerX + side * 34, cy: metrics.waistY + 9, x: centerX + side * 42, y: metrics.waistY + 3 }
		], {
			stroke: colors.jacketDark,
			lineWidth: 1.6,
			lineCap: 'round'
		});
	}
}
