// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';

/**
 * @file StableSkirt2D.js
 * @description Draws Miriam's continuous weighted skirt with asymmetric hem and quiet folds.
 * Malchus receives motion without losing modest grounded form; the Awtsmoos renews each
 * weighted curve while Awtsmoos.com preserves serialized width, sway, fold, and hem controls.
 */
export class StableSkirt2D {
	static build(data = {}, colors = {}, metrics = {}, suppliedGeometry = null) {
		if (!data.skirt) return null;
		const geometry = suppliedGeometry || StableBodyGeometry.resolve(data, metrics);
		const skirt = geometry.skirt;
		const centerX = Number.isFinite(skirt.centerX)
			? skirt.centerX
			: data._skeleton.hips.x;
		const fill = data.colors?.skirt || colors.pants || '#17181a';
		const topY = (geometry.torso?.hemY ?? metrics.hipY - 9) - 2;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.0014)
			* Number(skirt.sway || 1.1);
		const leftHem = centerX - skirt.bottomHalf + sway - Number(skirt.leftHemDrop || 0);
		const rightHem = centerX + skirt.bottomHalf + sway * 0.45 + Number(skirt.rightHemLift || 0);
		return G.group('stable_skirt', null, [
			this.mass(data, fill, colors, centerX, topY, metrics, skirt, leftHem, rightHem),
			...this.folds(data, colors, centerX, topY, metrics, skirt, sway),
			this.hemWeight(data, colors, centerX, skirt, leftHem, rightHem)
		]);
	}

	static mass(data, fill, colors, centerX, topY, metrics, skirt, leftHem, rightHem) {
		return G.path('skirt_mass', [
			{ type: 'move', x: centerX - skirt.topHalf, y: topY },
			{ type: 'quad', cx: centerX - skirt.bottomHalf, cy: metrics.kneeY - 8, x: leftHem, y: skirt.hemY - 1 },
			{ type: 'quad', cx: centerX - skirt.bottomHalf * 0.35, cy: skirt.hemY + 7, x: centerX, y: skirt.hemY + 4 },
			{ type: 'quad', cx: centerX + skirt.bottomHalf * 0.35, cy: skirt.hemY + 7, x: rightHem, y: skirt.hemY },
			{ type: 'quad', cx: centerX + skirt.bottomHalf, cy: metrics.kneeY - 8, x: centerX + skirt.topHalf, y: topY },
			{ type: 'quad', cx: centerX, cy: topY + 6, x: centerX - skirt.topHalf, y: topY }
		], LineArtStyle.exterior(data, fill));
	}

	static folds(data, colors, centerX, topY, metrics, skirt, sway) {
		return [-0.58, 0, 0.58].map((ratio, index) => G.path(`skirt_fold_${index}`, [
			{ type: 'move', x: centerX + ratio * skirt.topHalf * 0.55, y: topY + 7 },
			{ type: 'quad', cx: centerX + ratio * skirt.bottomHalf * 0.8 + sway, cy: metrics.kneeY, x: centerX + ratio * skirt.bottomHalf * 0.82 + sway, y: skirt.hemY - 5 }
		], {
			...LineArtStyle.interior(data, colors.skirtLight || 'rgba(255,255,255,0.09)'),
			lineWidth: index === 1 ? 1.2 : 0.95
		}));
	}

	static hemWeight(data, colors, centerX, skirt, leftHem, rightHem) {
		return G.path('skirt_weighted_hem', [
			{ type: 'move', x: leftHem + skirt.bottomHalf * 0.1, y: skirt.hemY - 1 },
			{ type: 'quad', cx: centerX, cy: skirt.hemY + 5, x: rightHem - skirt.bottomHalf * 0.1, y: skirt.hemY }
		], LineArtStyle.seam(data, colors.skirtLight || 'rgba(255,255,255,0.12)'));
	}
}
