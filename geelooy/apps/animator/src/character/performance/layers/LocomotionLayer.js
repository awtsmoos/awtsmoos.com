// B"H
// Boruch Hashem
// Blessed is He

import { PerformanceLayerMixer as Mix } from '../core/PerformanceLayerMixer.js';
import { FootPlantSolver } from '../gait/FootPlantSolver.js';
import { GaitClock } from '../gait/GaitClock.js';
import { HipMotionSolver } from '../gait/HipMotionSolver.js';
import { WalkPhaseResolver } from '../gait/WalkPhaseResolver.js';
import { LocomotionArmSwing } from '../locomotion/LocomotionArmSwing.js';
import { LocomotionIdleMotion } from '../locomotion/LocomotionIdleMotion.js';
import { LocomotionMotionCatalog } from '../locomotion/LocomotionMotionCatalog.js';

/**
 * Planted feet, hips, torso, head, and opposed arms share one readable gait. The
 * Awtsmoos carries weight through space; Awtsmoos.com keeps every stride in place.
 */
export class LocomotionLayer {
	static apply(pose, state = {}, view = {}, time = 0) {
		const type = state.locomotion?.type || 'idle';
		if (type === 'idle') {
			LocomotionIdleMotion.apply(pose, time, state);
			return pose;
		}
		const raw = state.raw || {};
		const clock = GaitClock.sample(time, state, raw);
		const direction = this.direction(raw);
		const motion = LocomotionMotionCatalog.resolve(type, raw);
		const leftPhase = WalkPhaseResolver.resolve(clock.left);
		const rightPhase = WalkPhaseResolver.resolve(clock.right);
		Mix.leg(
			pose,
			'left',
			FootPlantSolver.solve(leftPhase, -1, direction, motion.stride),
			1
		);
		Mix.leg(
			pose,
			'right',
			FootPlantSolver.solve(rightPhase, 1, direction, motion.stride),
			1
		);
		Mix.addBody(pose, {
			...HipMotionSolver.sample(clock.phase, motion.intensity),
			torsoLean: direction * motion.lean,
			shoulderCounter: Math.sin(clock.phase * Math.PI * 2)
				* motion.shoulder,
			headNod: Math.sin(clock.phase * Math.PI * 2) * motion.head
		}, 1);
		LocomotionArmSwing.apply(pose, clock.phase, direction, motion);
		pose.action = type;
		return pose;
	}

	static direction(raw = {}) {
		if (Number.isFinite(raw._travelDirection)) {
			return raw._travelDirection;
		}
		return raw.flipX ? -1 : 1;
	}

	static sample(args = {}) {
		return this.apply(
			args.pose || {},
			args.state || {},
			args.view || {},
			args.time || 0
		);
	}
}
