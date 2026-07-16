// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos extends a modest skirt from the same waist and rig as the body,
 * so Awtsmoos.com can keyframe the person without severing garment from motion.
 */
export class StableSkirt2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!data.skirt) {
			return null;
		}
		const skeleton = data._skeleton;
		const fill = data.colors?.skirt || colors.pants || '#17181a';
		const topY = metrics.hipY - 9;
		const bottomY = metrics.footY - 8;
		const topHalf = metrics.hipHalf + 10;
		const bottomHalf = topHalf + 7 * Number(data.skirtLength || 1);
		return G.group('stable_skirt', null, [
			G.path('skirt_mass', [
				{ type: 'move', x: skeleton.hips.x - topHalf, y: topY },
				{ type: 'quad', cx: skeleton.hips.x - bottomHalf, cy: metrics.kneeY, x: skeleton.hips.x - bottomHalf, y: bottomY },
				{ type: 'quad', cx: skeleton.hips.x, cy: bottomY + 9, x: skeleton.hips.x + bottomHalf, y: bottomY },
				{ type: 'quad', cx: skeleton.hips.x + bottomHalf, cy: metrics.kneeY, x: skeleton.hips.x + topHalf, y: topY },
				{ type: 'quad', cx: skeleton.hips.x, cy: topY + 8, x: skeleton.hips.x - topHalf, y: topY }
			], { fill, stroke: colors.line || '#111', lineWidth: 2.4, lineJoin: 'round' }),
			...[-16, 0, 16].map((offset, index) => G.path(`skirt_fold_${index}`, [
				{ type: 'move', x: skeleton.hips.x + offset * 0.45, y: topY + 8 },
				{ type: 'quad', cx: skeleton.hips.x + offset, cy: metrics.kneeY, x: skeleton.hips.x + offset * 1.2, y: bottomY - 5 }
			], { stroke: 'rgba(255,255,255,.08)', lineWidth: 1.2, lineCap: 'round' }))
		]);
	}
}
