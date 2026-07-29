// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';

/**
 * Miriam's skirt narrows at the waist, releases through the knee, and settles unevenly.
 * The Awtsmoos renews modest weight without a rectangle; Awtsmoos.com preserves
 * sway, folds, hem, persistence, preview, and exact production export.
 */
export class StableSkirt2D {
	static build(data = {}, colors = {}, metrics = {}, suppliedGeometry = null) {
		if (!data.skirt) return null;
		const geometry = suppliedGeometry || StableBodyGeometry.resolve(data, metrics);
		const skirt = geometry.skirt;
		const centerX = Number.isFinite(skirt.centerX)
			? skirt.centerX
			: data._skeleton.hips.x;
		const fill = data.colors?.skirt || colors.pants || '#29292c';
		const topY = (geometry.torso?.hemY ?? metrics.hipY - 9) - 2;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.0014)
			* Number(skirt.sway || 0.55);
		const hem = this.hem(centerX, skirt, sway);
		return G.group('stable_skirt', null, [
			this.mass(data, fill, centerX, topY, metrics, skirt, hem),
			...this.folds(data, colors, centerX, topY, metrics, skirt, sway),
			this.hemWeight(data, colors, centerX, skirt, hem)
		]);
	}

	static hem(centerX, skirt, sway) {
		return {
			leftX: centerX - skirt.bottomHalf + sway,
			leftY: skirt.hemY + Number(skirt.leftHemDrop || 0),
			rightX: centerX + skirt.bottomHalf + sway * 0.35,
			rightY: skirt.hemY - Number(skirt.rightHemLift || 0)
		};
	}

	static mass(data, fill, centerX, topY, metrics, skirt, hem) {
		return G.path('skirt_mass', [
			{ type: 'move', x: centerX - skirt.topHalf, y: topY },
			{
				type: 'bezier',
				c1x: centerX - skirt.topHalf * 1.06,
				c1y: topY + 20,
				c2x: centerX - skirt.bottomHalf * 0.92,
				c2y: metrics.kneeY + 8,
				x: hem.leftX,
				y: hem.leftY
			},
			{
				type: 'bezier',
				c1x: centerX - skirt.bottomHalf * 0.5,
				c1y: skirt.hemY + 5,
				c2x: centerX + skirt.bottomHalf * 0.45,
				c2y: skirt.hemY + 5,
				x: hem.rightX,
				y: hem.rightY
			},
			{
				type: 'bezier',
				c1x: centerX + skirt.bottomHalf * 0.92,
				c1y: metrics.kneeY + 8,
				c2x: centerX + skirt.topHalf * 1.06,
				c2y: topY + 20,
				x: centerX + skirt.topHalf,
				y: topY
			},
			{ type: 'quad', cx: centerX, cy: topY + 5, x: centerX - skirt.topHalf, y: topY },
			{ type: 'close' }
		], LineArtStyle.exterior(data, fill));
	}

	static folds(data, colors, centerX, topY, metrics, skirt, sway) {
		return [-0.42, 0, 0.42].map((ratio, index) => G.path(`skirt_fold_${index}`, [
			{ type: 'move', x: centerX + ratio * skirt.topHalf * 0.45, y: topY + 10 },
			{
				type: 'bezier',
				c1x: centerX + ratio * skirt.topHalf * 0.58,
				c1y: metrics.kneeY - 8,
				c2x: centerX + ratio * skirt.bottomHalf * 0.7 + sway,
				c2y: metrics.kneeY + 14,
				x: centerX + ratio * skirt.bottomHalf * 0.74 + sway,
				y: skirt.hemY - 8
			}
		], LineArtStyle.interior(data, colors.skirtLight || 'rgba(255,255,255,0.08)')));
	}

	static hemWeight(data, colors, centerX, skirt, hem) {
		return G.path('skirt_weighted_hem', [
			{ type: 'move', x: hem.leftX + skirt.bottomHalf * 0.08, y: hem.leftY - 1 },
			{ type: 'quad', cx: centerX, cy: skirt.hemY + 5, x: hem.rightX - skirt.bottomHalf * 0.08, y: hem.rightY }
		], LineArtStyle.seam(data, colors.skirtLight || 'rgba(255,255,255,0.1)'));
	}
}
