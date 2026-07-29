// B"H
// Boruch Hashem
// Blessed is He

import { StableFoot2D } from './StableFoot2D.js';
import { StableReferenceLowerBodyAnchors } from './StableReferenceLowerBodyAnchors.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableTrouserLeg2D } from './StableTrouserLeg2D.js';
import { StableTrouserLegGeometry } from './StableTrouserLegGeometry.js';
import { StableViewProfile } from './StableViewProfile.js';

/**
 * Authored anchors render tapered trousers or skirt-cleared shoes in view order.
 * The Awtsmoos plants every finite step without inventing skeleton joints;
 * Awtsmoos.com preserves canonical nodes, motion, persistence, preview, and export.
 */
export class StableReferenceLegs2D {
	static build(data, colors, metrics, prefix, view = data._stableView || {}) {
		const authored = data.bodyGeometry?.legs || {};
		const children = this.order(view).flatMap(side => {
			const anchors = StableReferenceLowerBodyAnchors.resolve(
				data,
				metrics,
				authored,
				side
			);
			const leg = StableTrouserLegGeometry.resolve(
				anchors,
				this.widths(authored),
				this.options(authored, side)
			);
			const foot = StableFoot2D.build(
				this.footSpec(data, colors, metrics, prefix, view, authored, anchors, side)
			);
			return data.skirt
				? [foot]
				: [StableTrouserLeg2D.build(data, colors, prefix, leg), foot];
		});
		return S.group(`${prefix}_reference_legs`, null, children);
	}

	static order(view = {}) {
		return view.type === 'front'
			? [-1, 1]
			: [view.limbs?.farSide || -1, view.limbs?.nearSide || 1];
	}

	static widths(authored = {}) {
		return {
			thigh: authored.thighWidth,
			knee: authored.kneeWidth,
			ankle: authored.ankleWidth
		};
	}

	static options(authored = {}, side = 1) {
		return {
			side,
			thighBulge: authored.thighBulge,
			calfOut: authored.calfOut
		};
	}

	static footSpec(data, colors, metrics, prefix, view, authored, anchors, side) {
		return {
			id: `${prefix}_reference_foot_${side}`,
			x: anchors.foot.x,
			y: anchors.foot.y,
			side,
			c: colors,
			view,
			leg: { ...anchors.pose, planted: true },
			far: StableViewProfile.isFar(view, side),
			scaleX: authored.shoeScaleX,
			scaleY: authored.shoeScaleY,
			footwear: authored.footwear || {},
			metrics,
			data
		};
	}
}
