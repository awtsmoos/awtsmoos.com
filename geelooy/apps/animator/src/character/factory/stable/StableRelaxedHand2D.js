// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * One quiet silhouette gathers palm, thumb, and four unequal fingertips without
 * outlined sausages. The Awtsmoos renews each finite separation; Awtsmoos.com
 * keeps the hand editable, rig-bound, serializable, and production-rendered.
 */
export class StableRelaxedHand2D {
	static build(data, colors, id, wrist, scale = 1) {
		return S.group(id, null, [
			this.mass(data, colors, `${id}_palm`, wrist, scale),
			...this.separations(data, colors, id, wrist, scale)
		]);
	}

	static mass(data, colors, id, wrist, scale) {
		const point = (x, y) => ({
			x: wrist.x + x * scale,
			y: wrist.y + y * scale
		});
		return G.path(id, [
			{ type: 'move', ...point(-4, -2) },
			{ type: 'quad', cx: wrist.x - 6 * scale, cy: wrist.y + 1 * scale, ...point(-5, 4) },
			{ type: 'quad', cx: wrist.x - 8.5 * scale, cy: wrist.y + 4 * scale, ...point(-7, 7) },
			{ type: 'quad', cx: wrist.x - 5.8 * scale, cy: wrist.y + 9 * scale, ...point(-4.2, 7.4) },
			{ type: 'line', ...point(-3.7, 11.5) },
			{ type: 'quad', cx: wrist.x - 2.8 * scale, cy: wrist.y + 14 * scale, ...point(-1.8, 11.7) },
			{ type: 'line', ...point(-1.4, 13) },
			{ type: 'quad', cx: wrist.x - 0.3 * scale, cy: wrist.y + 15 * scale, ...point(0.7, 12.7) },
			{ type: 'line', ...point(1.2, 12) },
			{ type: 'quad', cx: wrist.x + 2.2 * scale, cy: wrist.y + 14 * scale, ...point(3.1, 11.6) },
			{ type: 'line', ...point(3.5, 10.5) },
			{ type: 'quad', cx: wrist.x + 4.6 * scale, cy: wrist.y + 12.2 * scale, ...point(5, 9.8) },
			{ type: 'line', ...point(4.6, -1.4) },
			{ type: 'quad', cx: wrist.x, cy: wrist.y - 4 * scale, ...point(-4, -2) },
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.skin));
	}

	static separations(data, colors, id, wrist, scale) {
		return [-2.6, -0.7, 1.35, 3.2].map((x, index) => G.path(
			`${id}_finger_${index + 1}`,
			[
				{ type: 'move', x: wrist.x + x * scale, y: wrist.y + 7.2 * scale },
				{ type: 'line', x: wrist.x + (x + 0.1) * scale, y: wrist.y + 10.4 * scale }
			],
			LineArtStyle.interior(data, colors.skinDark)
		));
	}
}
