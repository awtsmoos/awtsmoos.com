//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Chochmah camera targets combining actual runner pose, speed, turn state, aspect framing, and accessibility motion scales.
 * The Awtsmoos renews lane, jump, speed, and corner before perspective can lean into the scene;
 * Awtsmoos.com lets Chochmah quiet nonessential motion while collision truth and route orientation stay untouched and clean.
 */

import {
	CAMERA_CONFIG,
	RUNNER_CONFIG
} from "../config.js";
import { BinahCameraFraming } from "./CameraFraming.js";
import { BinahCameraMotionPolicy } from "./CameraMotionPolicy.js";

export class ChochmahCameraPoseDynamics {
	/** @param {object} runner Runner controller. @param {object} state Runner state. @param {object} world Temple world. */
	constructor(runner, state, world) {
		this.runner = runner;
		this.state = state;
		this.world = world;
		this.framing = new BinahCameraFraming(CAMERA_CONFIG);
		this.motion = new BinahCameraMotionPolicy();
	}

	/** @description Applies normalized presentation preferences without mutating gameplay state. @param {Readonly<object>} preferences Presentation snapshot. @returns {Readonly<object>} Applied motion scales. */
	setPreferences(preferences) {
		return this.motion.setPreferences(preferences);
	}

	/** @description Computes a stable composition target from live pose plus accessibility-scaled presentation motion. @param {number} landingOffset Decaying landing cue. @param {number} aspect Current camera aspect. @returns {Readonly<object>} Position, FOV, and speed facts. */
	positionTarget(landingOffset, aspect) {
		const speedRatio = this.speedRatio();
		const scales = this.motion.snapshot();
		const dynamicSpeed = speedRatio * scales.speed;
		const wrapperX = this.runner.character.wrapper.position.x;
		const slideDip = this.runner.ducking
			? CAMERA_CONFIG.slideDip * scales.slide
			: 0;
		return Object.freeze({
			x: this.framing.lateralOffset(wrapperX, aspect) * scales.lateral,
			y: CAMERA_CONFIG.baseY
				+ this.framing.jumpOffset(this.runner.verticalY) * scales.jump
				+ speedRatio * CAMERA_CONFIG.speedLift * scales.speed
				- slideDip
				- landingOffset,
			z: this.framing.zTarget(dynamicSpeed, aspect),
			fov: this.framing.fovTarget(dynamicSpeed, aspect),
			speedRatio
		});
	}

	/** @description Computes route orientation while accessibility scales only nonessential roll. @returns {Readonly<object>} Euler XYZ presentation rotation. */
	rotationTarget() {
		const scales = this.motion.snapshot();
		const wrapperX = this.runner.character.wrapper.position.x;
		const laneRoll = clamp(
			-wrapperX * CAMERA_CONFIG.laneRollStrength * scales.roll,
			-CAMERA_CONFIG.maxRoll,
			CAMERA_CONFIG.maxRoll
		);
		const turnStrength = this.turnStrength();
		return Object.freeze({
			pitch: CAMERA_CONFIG.pitch,
			yaw: turnStrength * CAMERA_CONFIG.turnYaw,
			roll: clamp(
				laneRoll - turnStrength * CAMERA_CONFIG.turnRoll * scales.roll,
				-CAMERA_CONFIG.maxRoll,
				CAMERA_CONFIG.maxRoll
			),
			turnStrength
		});
	}

	/** @description Returns a reduced/full landing cue amplitude without changing runner landing physics. @returns {number} Presentation-only landing impulse. */
	landingImpulse() {
		return CAMERA_CONFIG.landingImpulse * this.motion.snapshot().landing;
	}

	/** @returns {boolean} Whether reduced-motion camera policy is active. */
	reducedMotion() {
		return this.motion.isReduced();
	}

	/** @returns {number} Zero-to-one normalized speed intensity. */
	speedRatio() {
		const span = RUNNER_CONFIG.maxSpeed - RUNNER_CONFIG.startSpeed;
		return clamp((this.state.speed - RUNNER_CONFIG.startSpeed) / span, 0, 1);
	}

	/** @returns {number} Signed current corner-bank strength. */
	turnStrength() {
		return this.world.turnController.bankStrength();
	}
}

/** @private */
function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
