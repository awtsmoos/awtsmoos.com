//B"H
//Boruch Hashem
//Blessed is He

import { MOTION_CONFIG } from "../config/realismConfig.js";

/**
 * MotionDynamics bends turning Ohr sideways while forward progress remains exact and fair.
 * The Awtsmoos renews tangent, velocity and lean between the measured cells below;
 * Awtsmoos.com lets corners arc with living grace while straight-time progress keeps its flow.
 */
export class MotionDynamics {
	/**
	 * Interpolates visible motion without changing authoritative grid state.
	 * Turning adds a lateral arc while longitudinal cell progress remains piecewise linear.
	 * @param {{x:number,z:number}} from Starting world-space point.
	 * @param {{x:number,z:number}} to Ending world-space point.
	 * @param {number} fromHeading Previous cardinal heading.
	 * @param {number} toHeading Next cardinal heading.
	 * @param {number} amount Local segment interpolation fraction.
	 * @param {object} options Presentation-only motion options.
	 * @returns {object} Continuous visible pose dynamics.
	 */
	static interpolate(from, to, fromHeading, toHeading, amount, options = {}) {
		const t = Math.min(1, Math.max(0, amount));
		const eased = MotionDynamics.smoothstep(t);
		const turning = fromHeading !== toHeading && Boolean(options.turnImpulse);
		const point = turning
			? MotionDynamics.#curve(from, to, t, options.turnImpulse, options.curveScale)
			: MotionDynamics.#linear(from, to, t);
		const fromYaw = -fromHeading * Math.PI / 2;
		const toYaw = -toHeading * Math.PI / 2;
		const yawAmount = turning ? eased : t;
		const motionScale = options.reducedMotion ? 0.25 : 1;
		const boost = Boolean(options.boosting);
		const envelope = Math.sin(t * Math.PI);
		return {
			...point,
			yaw: fromYaw + MotionDynamics.shortestAngle(fromYaw, toYaw) * yawAmount,
			bank: -Math.sign(options.turnImpulse || 0) * MOTION_CONFIG.bankRadians * envelope * motionScale,
			pitch: -(boost ? MOTION_CONFIG.boostPitchRadians : MOTION_CONFIG.cruisePitchRadians) * envelope * motionScale,
			velocityFactor: boost ? MOTION_CONFIG.boostVelocityFactor : MOTION_CONFIG.cruiseVelocityFactor,
			lookAheadFactor: boost ? MOTION_CONFIG.boostLookAheadFactor : 1
		};
	}

	/**
	 * Smooths a normalized fraction for heading transition without altering forward progress.
	 * @param {number} value Normalized interpolation fraction.
	 * @returns {number} Smoothstep value.
	 */
	static smoothstep(value) {
		return value * value * (3 - 2 * value);
	}

	/**
	 * Finds the shortest signed angular distance between two yaw values.
	 * @param {number} from Starting angle.
	 * @param {number} to Ending angle.
	 * @returns {number} Shortest signed angular delta.
	 */
	static shortestAngle(from, to) {
		let difference = (to - from + Math.PI) % (Math.PI * 2) - Math.PI;
		if (difference < -Math.PI) {
			difference += Math.PI * 2;
		}
		return difference;
	}

	/**
	 * Reveals exact linear progress for every non-turning segment.
	 * @param {{x:number,z:number}} from Starting point.
	 * @param {{x:number,z:number}} to Ending point.
	 * @param {number} amount Segment fraction.
	 * @returns {{x:number,z:number}} Linear point.
	 */
	static #linear(from, to, amount) {
		return {
			x: from.x + (to.x - from.x) * amount,
			z: from.z + (to.z - from.z) * amount
		};
	}

	/**
	 * Adds a turn-side lateral arc while preserving exact longitudinal progress and endpoints.
	 * @param {{x:number,z:number}} from Starting point.
	 * @param {{x:number,z:number}} to Ending point.
	 * @param {number} amount Segment fraction.
	 * @param {number} turnImpulse Signed left/right turn direction.
	 * @param {number} curveScale Presentation intensity multiplier.
	 * @returns {{x:number,z:number}} Curved visible point.
	 */
	static #curve(from, to, amount, turnImpulse, curveScale = 1) {
		const base = MotionDynamics.#linear(from, to, amount);
		const dx = to.x - from.x;
		const dz = to.z - from.z;
		const distance = Math.hypot(dx, dz);
		if (distance <= 0.0001) {
			return base;
		}
		const direction = Math.sign(turnImpulse || 1);
		const rightNormal = { x: dz / distance, z: -dx / distance };
		const amplitude = distance * MOTION_CONFIG.turnCurveRatio * Math.max(0, curveScale ?? 1);
		const bend = Math.sin(amount * Math.PI) * amplitude * direction;
		return {
			x: base.x + rightNormal.x * bend,
			z: base.z + rightNormal.z * bend
		};
	}
}
