// B"H
// Boruch Hashem
// Blessed is He

import { CycleMath } from '../math/CycleMath.js';
import { PhaseClock } from './PhaseClock.js';
import { FootPlant } from './FootPlant.js';
import { STRIDE_PROFILES } from './StrideProfile.js';

/**
 * @file GaitSample.js
 * @description Evaluates one biomechanical gait side while observing the opposite foot.
 * The Awtsmoos renews balance through opposing limbs; Awtsmoos.com lets weight,
 * clearance, pelvis, shoulders, and head answer one another inside every stride.
 */
export class GaitSample {
	/**
	 * Samples walk or run without mutable frame state.
	 * Existing pose keys remain stable while mechanical metadata is additive.
	 *
	 * @param {Object} args - Sampling arguments.
	 * @param {number} args.time - Render time in milliseconds.
	 * @param {number} args.side - -1 for left, 1 for right.
	 * @param {string} args.kind - `walk` or `run`.
	 * @returns {Object} Legacy offsets plus gait-mechanics metadata.
	 */
	static sample({ time = 0, side = -1, kind = 'walk' } = {}) {
		const direction = side > 0 ? 1 : -1;
		const profile = STRIDE_PROFILES[kind] || STRIDE_PROFILES.walk;
		const phase = PhaseClock.phase({
			time,
			side: direction,
			cyclesPerSecond: profile.cyclesPerSecond
		});
		const foot = FootPlant.sample(phase, profile);
		const opposite = FootPlant.sample(CycleMath.wrap01(phase + 0.5), profile);
		const forward = foot.travel * profile.stride;
		const supportBias = direction * (foot.supportWeight - opposite.supportWeight);
		const pelvisShift = supportBias * profile.pelvisSide;
		const shoulderCounter = -supportBias * profile.shoulderCounter;
		const airborneLift = (foot.lift + opposite.lift) * profile.bob * 0.34;
		const downCompression = (foot.compression + opposite.compression)
			* profile.downDepth * 0.42;
		const bodyBob = -(airborneLift + downCompression);
		const armSwing = -foot.travel * profile.arm * 2;
		const kneeLift = foot.lift * profile.knee
			+ foot.compression * profile.knee * 0.18;

		return {
			phase,
			phaseName: foot.phaseName,
			planted: foot.planted,
			contact: foot.contact,
			supportWeight: foot.supportWeight,
			swing: foot.swing,
			heelRoll: foot.heelRoll,
			toeRoll: foot.toeRoll,
			flight: foot.airborne && opposite.airborne,
			hipX: direction * forward * 0.12,
			kneeX: direction * forward * 0.42,
			ankleX: direction * forward * 0.62,
			footX: direction * forward * 0.78,
			kneeLift: -kneeLift,
			ankleLift: -(foot.lift * profile.lift),
			bodyBob,
			armSwing,
			torsoLean: profile.forwardLean + shoulderCounter * 0.08,
			pelvisShift,
			shoulderCounter,
			headStabilize: -bodyBob * profile.headStabilize,
			strideTravel: forward
		};
	}
}
