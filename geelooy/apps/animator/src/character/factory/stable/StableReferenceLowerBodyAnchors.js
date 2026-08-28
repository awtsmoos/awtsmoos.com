// B"H
// Boruch Hashem
// Blessed is He

import { StableLowerBodyMotionProfile } from './StableLowerBodyMotionProfile.js';
import { StablePelvisMotionChain } from './StablePelvisMotionChain.js';

/**
 * Authored stance offsets and living pose channels derive every lower-body anchor.
 * The Awtsmoos renews hip, knee, ankle, and foot from one measured vessel;
 * Awtsmoos.com lets pelvis weight descend through the chain without dragging the sole.
 */
export class StableReferenceLowerBodyAnchors {
	/**
	 * Resolves articulated anchors without mutating authored or generated pose data.
	 * @param {Object} data - Prepared stable-character data with skeleton and pose.
	 * @param {Object} metrics - Stable reference vertical measurements.
	 * @param {Object} authored - Optional authored leg geometry.
	 * @param {number} side - Negative for left/far, positive for right/near.
	 * @returns {{pose:Object,hip:Object,knee:Object,ankle:Object,foot:Object}}
	 */
	static resolve(data = {}, metrics = {}, authored = {}, side = 1) {
		const pose = this.pose(data, side);
		const centers = StablePelvisMotionChain.resolve(data, authored);
		const motion = StableLowerBodyMotionProfile.resolve(authored, data);
		return {
			pose,
			hip: this.hip(centers.hip, metrics, authored, pose, side, motion),
			knee: this.knee(centers.knee, metrics, authored, pose, side, motion),
			ankle: this.ankle(centers.ankle, metrics, authored, pose, side, motion),
			foot: this.foot(centers.foot, metrics, authored, pose, side, motion)
		};
	}

	/** @returns {{x:number,y:number}} Hip anchor with full pelvis transfer. */
	static hip(center, metrics, authored, pose, side, motion) {
		return {
			x: center + side * this.sideOffset(authored, side, 'Hip', 'hipOffset', 22)
				+ this.number(pose.hipX, 0) * motion.hipX,
			y: this.number(metrics.hipY, -91) - 3
				+ this.number(pose.hipY, 0) * motion.hipY
		};
	}

	/** @returns {{x:number,y:number}} Knee anchor inheriting most pelvis transfer. */
	static knee(center, metrics, authored, pose, side, motion) {
		return {
			x: center + side * this.sideOffset(authored, side, 'Knee', 'kneeOffset', 22)
				+ this.number(pose.kneeX, 0) * motion.kneeX,
			y: this.number(metrics.kneeY, -46) + this.number(authored.kneeDrop, 2)
				+ this.number(pose.kneeY, 0) * motion.kneeY
		};
	}

	/** @returns {{x:number,y:number}} Ankle anchor inheriting limited pelvis transfer. */
	static ankle(center, metrics, authored, pose, side, motion) {
		return {
			x: center + side * this.sideOffset(authored, side, 'Ankle', 'ankleOffset', 21)
				+ this.number(pose.ankleX, 0) * motion.ankleX,
			y: this.number(metrics.ankleY, -8) + this.number(authored.ankleLift, -2)
				+ this.number(pose.ankleY, 0) * motion.ankleY
		};
	}

	/** @returns {{x:number,y:number}} Ground anchor independent of pelvis translation. */
	static foot(center, metrics, authored, pose, side, motion) {
		return {
			x: center + side * this.sideOffset(authored, side, 'Foot', 'footOffset', 24)
				+ this.number(pose.footX, 0) * motion.footX,
			y: this.number(metrics.footY, 6) + this.number(authored.footDrop, 0)
				+ this.number(pose.footY, 0) * motion.footY
		};
	}

	/** @param {Object} data @param {number} side @returns {Object} Generated leg pose. */
	static pose(data = {}, side = 1) {
		const legs = data._stablePose?.legs || {};
		return side < 0 ? legs.left || {} : legs.right || {};
	}

	/** @returns {number} Side-specific authored stance offset with symmetric fallback. */
	static sideOffset(authored, side, suffix, fallbackKey, fallback) {
		const sideKey = `${side < 0 ? 'left' : 'right'}${suffix}Offset`;
		return this.number(authored[sideKey], this.number(authored[fallbackKey], fallback));
	}

	/** @param {*} value @param {number} fallback @returns {number} Finite numeric value. */
	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
