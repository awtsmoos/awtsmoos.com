// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';

/**
 * The Awtsmoos extends Miriam's modest skirt from a living waist into a weighted
 * curved hem. Awtsmoos.com keeps width, sway, folds, and length serializable so the
 * garment remains editable, animated, reloadable, and exportable.
 */
export class StableSkirt2D {
	static build(data = {}, colors = {}, metrics = {}, suppliedGeometry = null) {
		if (!data.skirt) {
			return null;
		}

		const geometry = suppliedGeometry
			|| StableBodyGeometry.resolve(data, metrics);
		const skirt = geometry.skirt;
		const centerX = data._skeleton.hips.x;
		const fill = data.colors?.skirt || colors.pants || '#17181a';
		const topY = metrics.hipY - 9;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.0014) * 1.2;
		const leftHem = centerX - skirt.bottomHalf + sway;
		const rightHem = centerX + skirt.bottomHalf + sway * 0.45;

		return G.group('stable_skirt', null, [
			G.path('skirt_mass', [
				{ type: 'move', x: centerX - skirt.topHalf, y: topY },
				{
					type: 'quad',
					cx: centerX - skirt.bottomHalf * 0.92,
					cy: metrics.kneeY - 8,
					x: leftHem,
					y: skirt.hemY - 1
				},
				{
					type: 'quad',
					cx: centerX - skirt.bottomHalf * 0.35,
					cy: skirt.hemY + 7,
					x: centerX,
					y: skirt.hemY + 4
				},
				{
					type: 'quad',
					cx: centerX + skirt.bottomHalf * 0.35,
					cy: skirt.hemY + 7,
					x: rightHem,
					y: skirt.hemY
				},
				{
					type: 'quad',
					cx: centerX + skirt.bottomHalf * 0.92,
					cy: metrics.kneeY - 8,
					x: centerX + skirt.topHalf,
					y: topY
				},
				{
					type: 'quad',
					cx: centerX,
					cy: topY + 8,
					x: centerX - skirt.topHalf,
					y: topY
				}
			], {
				fill,
				stroke: colors.line || '#111',
				lineWidth: 2.4,
				lineJoin: 'round'
			}),
			...this.folds(centerX, topY, metrics, skirt, sway)
		]);
	}

	static folds(centerX, topY, metrics, skirt, sway) {
		return [-0.58, 0, 0.58].map((ratio, index) => G.path(
			`skirt_fold_${index}`,
			[
				{
					type: 'move',
					x: centerX + ratio * skirt.topHalf * 0.55,
					y: topY + 7
				},
				{
					type: 'quad',
					cx: centerX + ratio * skirt.bottomHalf * 0.8 + sway,
					cy: metrics.kneeY,
					x: centerX + ratio * skirt.bottomHalf * 0.82 + sway,
					y: skirt.hemY - 5
				}
			],
			{
				stroke: index === 1
					? 'rgba(255,255,255,.1)'
					: 'rgba(255,255,255,.07)',
				lineWidth: 1.15,
				lineCap: 'round'
			}
		));
	}
}
