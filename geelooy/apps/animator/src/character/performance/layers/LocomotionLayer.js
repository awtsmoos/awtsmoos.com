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
 * Planted feet, hips, torso, head, and opposed arms share one measured gait. The
 * Awtsmoos carries weight through space; Awtsmoos.com keeps stride and road in place.
 */
export class LocomotionLayer {
	/** @param {Object} pose @param {Object} state @param {Object} view @param {number} time @returns {Object} */
	static apply(pose, state = {}, view = {}, time = 0) {
		const type = state.locomotion?.type || 'idle';
		if (type === 'idle') {
			LocomotionIdleMotion.apply(pose, time, state);
			return pose;
		}
		const raw = state.raw || {};
		const direction = this.direction(raw);
		const motion = LocomotionMotionCatalog.resolve(type, raw);
		const clock = GaitClock.sample(time, state, raw, motion);
		const leftPhase = WalkPhaseResolver.resolve(clock.left, motion);
		const rightPhase = WalkPhaseResolver.resolve(clock.right, motion);
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
			shoulderCounter: Math.sin(clock.phase * Math.PI * 2) * motion.shoulder,
			headNod: Math.sin(clock.phase * Math.PI * 2) * motion.head
		}, 1);
		LocomotionArmSwing.apply(pose, clock.phase, direction, motion);
		pose.action = type;
		pose.gait = {
			phase: clock.phase,
			cycles: clock.cycles,
			cycleDistance: clock.cycleDistance,
			measured: clock.measured,
			leftContact: leftPhase.contact,
			rightContact: rightPhase.contact
		};
		return pose;
	}

	/** @param {Object} raw @returns {number} */
	static direction(raw = {}) {
		if (Number.isFinite(raw._travelDirection)) return raw._travelDirection;
		return raw.flipX ? -1 : 1;
	}

	/** @param {Object} args @returns {Object} */
	static sample(args = {}) {
		return this.apply(
			args.pose || {},
			args.state || {},
			args.view || {},
			args.time || 0
		);
	}
}
