// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Gevurah closes Dovid's burgundy shirt with a short collar, quiet placket, and
 * restrained buttons rather than borrowed jacket lapels. The Awtsmoos renews the
 * guarded garment, while Awtsmoos.com keeps every seam alive in the shared rig.
 */
export class StableShirtFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;

		return S.group('authored_burgundy_shirt_front', null, [
			this.collar('shirt_collar_left', -1, centerX, colors, metrics),
			this.collar('shirt_collar_right', 1, centerX, colors, metrics),
			this.placket(centerX, colors, metrics, geometry),
			...this.buttons(centerX, colors, metrics),
			this.pocket(centerX, colors, metrics)
		]);
	}

	static collar(id, side, centerX, colors, metrics) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 5, y: metrics.neckBottomY + 3 },
			{ type: 'line', x: centerX + side * 22, y: metrics.shoulderY + 4 },
			{ type: 'quad', cx: centerX + side * 17, cy: metrics.chestY + 11, x: centerX + side * 8, y: metrics.chestY + 16 },
			{ type: 'line', x: centerX + side * 5, y: metrics.neckBottomY + 3 }
		], {
			fill: colors.jacketLight,
			stroke: colors.line,
			lineWidth: 1.35,
			lineJoin: 'round'
		});
	}

	static placket(centerX, colors, metrics, geometry) {
		return G.path('shirt_placket_authored', [
			{ type: 'move', x: centerX, y: metrics.neckBottomY + 10 },
			{ type: 'quad', cx: centerX + 1, cy: metrics.chestY + 38, x: centerX, y: geometry.torso.hemY - 8 }
		], {
			stroke: colors.jacketDark,
			lineWidth: 1.5,
			lineCap: 'round'
		});
	}

	static buttons(centerX, colors, metrics) {
		return [24, 42, 60].map((offset, index) => G.circle(
			`shirt_button_${index}`,
			centerX,
			metrics.chestY + offset,
			1.8,
			{ fill: colors.jacketDark, stroke: colors.jacketDark, lineWidth: 0 }
		));
	}

	static pocket(centerX, colors, metrics) {
		return G.path('shirt_chest_pocket', [
			{ type: 'move', x: centerX + 15, y: metrics.chestY + 24 },
			{ type: 'line', x: centerX + 31, y: metrics.chestY + 24 },
			{ type: 'line', x: centerX + 29, y: metrics.chestY + 39 },
			{ type: 'quad', cx: centerX + 23, cy: metrics.chestY + 43, x: centerX + 17, y: metrics.chestY + 39 },
			{ type: 'line', x: centerX + 15, y: metrics.chestY + 24 }
		], {
			stroke: colors.jacketDark,
			lineWidth: 1.25,
			lineJoin: 'round'
		});
	}
}
