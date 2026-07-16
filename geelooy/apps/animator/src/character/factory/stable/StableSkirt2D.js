// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';

/**
 * The Awtsmoos extends Miriam's modest skirt from the same living waist and rig.
 * Awtsmoos.com consumes authored widths and hem height as serializable data so
 * movement, editing, reload, and export never sever garment from character.
 */
export class StableSkirt2D {
	static build(data = {}, colors = {}, metrics = {}, suppliedGeometry = null) {
		if (!data.skirt) {
			return null;
		}
		const geometry = suppliedGeometry || StableBodyGeometry.resolve(data, metrics);
		const skirt = geometry.skirt;
		const centerX = data._skeleton.hips.x;
		const fill = data.colors?.skirt || colors.pants || '#17181a';
		const topY = metrics.hipY - 9;
		return G.group('stable_skirt', null, [
			G.path('skirt_mass', [
				{ type: 'move', x: centerX - skirt.topHalf, y: topY },
				{ type: 'quad', cx: centerX - skirt.bottomHalf, cy: metrics.kneeY, x: centerX - skirt.bottomHalf, y: skirt.hemY },
				{ type: 'quad', cx: centerX, cy: skirt.hemY + 8, x: centerX + skirt.bottomHalf, y: skirt.hemY },
				{ type: 'quad', cx: centerX + skirt.bottomHalf, cy: metrics.kneeY, x: centerX + skirt.topHalf, y: topY },
				{ type: 'quad', cx: centerX, cy: topY + 7, x: centerX - skirt.topHalf, y: topY }
			], { fill, stroke: colors.line || '#111', lineWidth: 2.4, lineJoin: 'round' }),
			...[-16, 0, 16].map((offset, index) => G.path(`skirt_fold_${index}`, [
				{ type: 'move', x: centerX + offset * 0.45, y: topY + 8 },
				{ type: 'quad', cx: centerX + offset, cy: metrics.kneeY, x: centerX + offset * 1.2, y: skirt.hemY - 5 }
			], { stroke: 'rgba(255,255,255,.08)', lineWidth: 1.2, lineCap: 'round' }))
		]);
	}
}
