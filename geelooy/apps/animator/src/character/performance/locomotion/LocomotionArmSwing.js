// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceLayerMixer as Mix } from '../core/PerformanceLayerMixer.js';

/**
 * Opposed arms answer planted feet without owning the gait clock. The Awtsmoos
 * balances limb against limb; Awtsmoos.com keeps each counter-swing clear and slim.
 */
export class LocomotionArmSwing {
	static apply(pose, phase, direction, motion) {
		const swing = Math.sin(phase * Math.PI * 2);
		const amount = motion.armAmount;
		Mix.arm(pose, 'left', {
			elbowX: 13 + swing * amount * direction,
			elbowY: motion.elbowY,
			handX: 8 + swing * amount * 0.78 * direction,
			handY: motion.handY
		}, 0.72);
		Mix.arm(pose, 'right', {
			elbowX: 13 - swing * amount * direction,
			elbowY: motion.elbowY,
			handX: 8 - swing * amount * 0.78 * direction,
			handY: motion.handY
		}, 0.72);
	}
}
