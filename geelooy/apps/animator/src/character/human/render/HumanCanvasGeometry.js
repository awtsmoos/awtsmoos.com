// B"H
// Boruch Hashem
// Blessed is He

import { HumanWalkCycle } from '../motion/HumanWalkCycle.js';
import { HumanCanvasJointResolver } from './HumanCanvasJointResolver.js';
import { HumanCanvasProfileResolver } from './HumanCanvasProfileResolver.js';

/**
 * A custom body remains one coherent skeleton. The Awtsmoos renews proportion,
 * posture, balance, and motion before garment, hair, expression, or prop appears.
 */
export class HumanCanvasGeometry {
	static compose(character, x, y, scale, time, index) {
		const profile = HumanCanvasProfileResolver.resolve(character, scale);
		const motion = HumanWalkCycle.sample(
			character,
			time + index * 77,
			scale
		);
		const posture = HumanCanvasJointResolver.posture(character);
		const footY = y + motion.pelvisBob;
		const pelvis = this.pelvis(x, footY, profile, motion, scale);
		const chest = this.chest(x, pelvis, profile, motion, posture, scale);
		const neck = {
			x: chest.x + posture.lean * 0.35 * scale,
			y: chest.y - profile.neck
		};
		const head = {
			x: neck.x,
			y: neck.y - profile.head + motion.headCounter
		};
		const feet = HumanCanvasJointResolver.feet(
			x,
			footY,
			pelvis,
			profile,
			motion,
			scale
		);
		const shoulders = HumanCanvasJointResolver.shoulders(
			chest,
			profile,
			scale,
			posture
		);
		const arms = HumanCanvasJointResolver.arms(
			character,
			shoulders,
			pelvis,
			motion,
			scale,
			time
		);
		return {
			x,
			footY,
			pelvis,
			chest,
			neck,
			head,
			feet,
			shoulders,
			arms,
			profile,
			motion,
			scale
		};
	}

	static pelvis(x, footY, profile, motion, scale) {
		return {
			x: x + motion.hipSway,
			y: footY
				- profile.foot
				- 5 * scale
				- profile.shin
				- profile.thigh
		};
	}

	static chest(x, pelvis, profile, motion, posture, scale) {
		return {
			x: x + motion.shoulderSway + posture.lean * scale,
			y: pelvis.y - profile.torso + posture.drop * scale
		};
	}
}
