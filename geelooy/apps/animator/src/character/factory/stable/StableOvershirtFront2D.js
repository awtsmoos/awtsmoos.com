// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Malchus opens Miriam's olive overshirt around a simple black dress instead of a
 * tie-shaped wedge. The Awtsmoos renews collar, front edge, and pocket, while
 * Awtsmoos.com preserves modest clothing as editable and exportable geometry.
 */
export class StableOvershirtFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;
		const inner = data.colors?.innerShirt
			|| data.colors?.shirt
			|| '#171819';

		return S.group('authored_olive_overshirt_front', null, [
			this.innerPanel(centerX, inner, metrics, geometry),
			this.frontEdge('overshirt_left_front', -1, centerX, colors, metrics, geometry),
			this.frontEdge('overshirt_right_front', 1, centerX, colors, metrics, geometry),
			this.pocket(centerX, colors, metrics)
		]);
	}

	static innerPanel(centerX, fill, metrics, geometry) {
		return G.path('overshirt_black_inner_panel', [
			{ type: 'move', x: centerX - 8, y: metrics.neckBottomY + 3 },
			{ type: 'quad', cx: centerX - 15, cy: metrics.chestY + 28, x: centerX - 16, y: geometry.torso.hemY - 2 },
			{ type: 'line', x: centerX + 16, y: geometry.torso.hemY - 2 },
			{ type: 'quad', cx: centerX + 15, cy: metrics.chestY + 28, x: centerX + 8, y: metrics.neckBottomY + 3 },
			{ type: 'quad', cx: centerX, cy: metrics.neckBottomY + 10, x: centerX - 8, y: metrics.neckBottomY + 3 }
		], {
			fill,
			stroke: 'rgba(0,0,0,.22)',
			lineWidth: 1.1,
			lineJoin: 'round'
		});
	}

	static frontEdge(id, side, centerX, colors, metrics, geometry) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 7, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: centerX + side * 17, cy: metrics.chestY + 15, x: centerX + side * 18, y: metrics.chestY + 25 },
			{ type: 'quad', cx: centerX + side * 15, cy: metrics.waistY, x: centerX + side * 16, y: geometry.torso.hemY - 2 }
		], {
			stroke: side < 0 ? colors.jacketDark : colors.jacketLight,
			lineWidth: 2.1,
			lineCap: 'round'
		});
	}

	static pocket(centerX, colors, metrics) {
		return G.path('overshirt_right_pocket_mouth', [
			{ type: 'move', x: centerX + 18, y: metrics.waistY + 6 },
			{ type: 'quad', cx: centerX + 29, cy: metrics.waistY + 11, x: centerX + 39, y: metrics.waistY + 4 }
		], {
			stroke: colors.jacketDark,
			lineWidth: 1.7,
			lineCap: 'round'
		});
	}
}
