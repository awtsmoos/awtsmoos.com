// B"H
// Boruch Hashem
// Blessed is He

import { BodyProportions } from './BodyProportions.js';

/**
 * Connected joints reveal one editable body beneath many visible garments.
 * The Awtsmoos is beyond every center, while Awtsmoos.com keeps independently
 * authored chest, shoulder, and pelvis anchors deterministic and rig-bound.
 */
export class SkeletonFactory {
	/**
	 * Creates the connected production skeleton.
	 *
	 * @param {Object} data Character data.
	 * @param {Object} metrics Stable character metrics.
	 * @param {Object} view View profile.
	 * @param {Object} pose Whole-body pose.
	 * @returns {Object} Connected skeleton.
	 */
	static create(data, metrics, view, pose) {
		const profile = BodyProportions.get(
			data.bodyProfile
				|| (data.archetype === 'sage' ? 'sage' : 'friendlyAverage')
		);
		const direction = view.dir || 1;
		const hipShift = Number(pose.body?.hipX || 0);
		const shoulderShift = Number(pose.body?.shoulderX || 0);
		const torsoLean = Number(pose.body?.torsoLean || 0);
		const authoredHipCenter = this.authoredHipCenter(data);
		const authoredShoulders = data.bodyGeometry?.shoulders || {};
		const root = { x: 0, y: 0 };
		const hips = {
			x: authoredHipCenter + hipShift * 0.35,
			y: metrics.hipY
		};
		const chest = {
			x: shoulderShift * 0.4 + torsoLean * 0.3,
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
			leftShoulder: {
				x: shoulderCenter - shoulderHalf + view.torso.farShoulderPull,
				y: metrics.shoulderY
					+ this.number(authoredShoulders.leftYOffset, 0)
			},
			rightShoulder: {
				x: shoulderCenter + shoulderHalf + view.torso.nearShoulderPush,
				y: metrics.shoulderY
					+ this.number(authoredShoulders.rightYOffset, 0)
			},
			leftHip: { x: hips.x - hipHalf, y: metrics.hipY },
			rightHip: { x: hips.x + hipHalf, y: metrics.hipY },
			dir: direction,
			proportions: profile,
			view,
			pose
		};
	}

	static authoredHipCenter(data = {}) {
		const pelvisCenter = data.bodyGeometry?.pelvis?.centerX;
		const skirtCenter = data.bodyGeometry?.skirt?.centerX;
		if (Number.isFinite(pelvisCenter)) {
			return pelvisCenter;
		}
		return Number.isFinite(skirtCenter) ? skirtCenter : 0;
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}

	static side(skeleton, name, side) {
		const key = `${side < 0 ? 'left' : 'right'}${name}`;
		return skeleton[key];
	}
}
