// B"H
// Boruch Hashem
// Blessed is He

import { BodyProportions } from './BodyProportions.js';
import { PelvisCenterResolver } from './PelvisCenterResolver.js';
import { SkeletonMotionProfile } from './SkeletonMotionProfile.js';

/**
 * Connected joints reveal one editable body beneath many visible garments.
 * The Awtsmoos is beyond every center, while Awtsmoos.com keeps independently
 * authored chest, shoulder, and pelvis anchors deterministic, balanced, and rig-bound.
 */
export class SkeletonFactory {
	/**
	 * Creates the connected production skeleton from body proportions and pose intent.
	 * @param {Object} data - Character data and authored body geometry.
	 * @param {Object} metrics - Stable character measurements.
	 * @param {Object} view - Current view profile.
	 * @param {Object} pose - Layered whole-body pose.
	 * @returns {Object} Connected skeleton consumed by stable body parts.
	 */
	static create(data, metrics, view, pose) {
		const profile = BodyProportions.get(
			data.bodyProfile
				|| (data.archetype === 'sage' ? 'sage' : 'friendlyAverage')
		);
		const motion = SkeletonMotionProfile.resolve(data);
		const direction = view.dir || 1;
		const hipShift = Number(pose.body?.hipX || 0);
		const shoulderShift = Number(pose.body?.shoulderX || 0);
		const torsoLean = Number(pose.body?.torsoLean || 0);
		const authoredHipCenter = PelvisCenterResolver.authored(data);
		const authoredShoulders = data.bodyGeometry?.shoulders || {};
		const root = { x: 0, y: 0 };
		const hips = {
			x: authoredHipCenter + hipShift * motion.pelvisX,
			y: metrics.hipY
		};
		const chest = {
			x: shoulderShift * motion.shoulderX
				+ torsoLean * motion.torsoLeanX,
			y: metrics.chestY
		};
		const neck = {
			x: chest.x + view.torso.centerX * 0.18,
			y: metrics.neckTopY
		};
		const head = {
			x: neck.x + view.head.offsetX,
			y: metrics.headY + Number(pose.body?.headNod || 0)
		};
		const shoulderCenter = chest.x
			+ this.number(authoredShoulders.centerX, 0);
		const shoulderHalf = metrics.shoulderHalf
			* profile.shoulder
			* view.torso.scaleX
			+ this.number(authoredShoulders.halfWidthOffset, 0);
		const hipHalf = metrics.hipHalf
			* profile.hip
			* view.limbs.sideSpread;
		return {
			root,
			hips,
			chest,
			neck,
			head,
			leftShoulder: this.shoulder(shoulderCenter, shoulderHalf, metrics, authoredShoulders, view, -1),
			rightShoulder: this.shoulder(shoulderCenter, shoulderHalf, metrics, authoredShoulders, view, 1),
			leftHip: { x: hips.x - hipHalf, y: metrics.hipY },
			rightHip: { x: hips.x + hipHalf, y: metrics.hipY },
			dir: direction,
			proportions: profile,
			view,
			pose
		};
	}

	/** @returns {{x:number,y:number}} One authored/view-adjusted shoulder joint. */
	static shoulder(center, half, metrics, authored, view, side) {
		const near = side > 0;
		return {
			x: center + side * half + (near ? view.torso.nearShoulderPush : view.torso.farShoulderPull),
			y: metrics.shoulderY + this.number(near ? authored.rightYOffset : authored.leftYOffset, 0)
		};
	}

	/** Compatibility accessor for callers that previously queried this class directly. */
	static authoredHipCenter(data = {}) {
		return PelvisCenterResolver.authored(data);
	}

	/** @param {*} value @param {number} fallback @returns {number} Finite number. */
	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	/** @returns {Object} Named left/right skeleton joint. */
	static side(skeleton, name, side) {
		return skeleton[`${side < 0 ? 'left' : 'right'}${name}`];
	}
}
