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
 * Articulated lower-body anchors render trousers and contact-aware footwear in view order.
 * The Awtsmoos renews stance and swing as distinct vessels; Awtsmoos.com lets the shoe
 * reveal whether it carries weight or flies, without falsifying the gait solver's truth.
 */
export class StableReferenceLegs2D {
	/**
	 * Builds both legs and footwear without mutating character or pose data.
	 * @param {Object} data - Prepared stable character data.
	 * @param {Object} colors - Character color palette.
	 * @param {Object} metrics - Stable body metrics.
	 * @param {string} prefix - Deterministic node-id prefix.
	 * @param {Object} view - Stable view profile.
	 * @returns {Object} StableShapeKit group node.
	 */
	static build(data, colors, metrics, prefix, view = data._stableView || {}) {
		const authored = data.bodyGeometry?.legs || {};
		const children = this.order(view).flatMap((side) => {
			const anchors = StableReferenceLowerBodyAnchors.resolve(data, metrics, authored, side);
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

	/** @param {Object} view @returns {number[]} Painter-order side sequence. */
	static order(view = {}) {
		return view.type === 'front'
			? [-1, 1]
			: [view.limbs?.farSide || -1, view.limbs?.nearSide || 1];
	}

	/** @param {Object} authored @returns {Object} Authored trouser widths. */
	static widths(authored = {}) {
		return {
			thigh: authored.thighWidth,
			knee: authored.kneeWidth,
			ankle: authored.ankleWidth
		};
	}

	/** @param {Object} authored @param {number} side @returns {Object} Leg-shape options. */
	static options(authored = {}, side = 1) {
		return {
			side,
			thighBulge: authored.thighBulge,
			calfOut: authored.calfOut
		};
	}

	/**
	 * Converts resolved foot anchors into footwear input while preserving contact truth.
	 * @returns {Object} Footwear render specification.
	 */
	static footSpec(data, colors, metrics, prefix, view, authored, anchors, side) {
		return {
			id: `${prefix}_reference_foot_${side}`,
			x: anchors.foot.x,
			y: anchors.foot.y,
			side,
			c: colors,
			view,
			leg: { ...anchors.pose, planted: Boolean(anchors.pose?.planted) },
			far: StableViewProfile.isFar(view, side),
			scaleX: authored.shoeScaleX,
			scaleY: authored.shoeScaleY,
			footwear: authored.footwear || {},
			metrics,
			data
		};
	}
}
