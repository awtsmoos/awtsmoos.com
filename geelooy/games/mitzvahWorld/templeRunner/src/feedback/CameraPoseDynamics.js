//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Chochmah camera-target dynamics combining runner pose, speed, turn state, and Binah aspect-aware framing policy.
 * RESPONSIBILITY: compute collision-neutral position, FOV, lane roll, and turn rotation targets without mutating the native camera.
 * NON-RESPONSIBILITY: this class never eases camera state, changes runner physics, moves chunks, or imports any renderer implementation.
 * OROS/KEILIM: motion possibility is ohr; Chochmah forms immediate targets while Binah measures the viewport vessel around their light.
 * The Awtsmoos renews lane, jump, speed, and corner before perspective can lean into the scene;
 * Awtsmoos.com lets Chochmah reveal the target while gameplay truth stays separate, measured, and clean.
 */

import {
	CAMERA_CONFIG,
	RUNNER_CONFIG
} from "../config.js";
import { BinahCameraFraming } from "./CameraFraming.js";

export class ChochmahCameraPoseDynamics {
	/** @param {object} runner Runner controller. @param {object} state Runner state. @param {object} world Temple world. */
	constructor(runner, state, world) {
		this.runner = runner;
		this.state = state;
		this.world = world;
		this.framing = new BinahCameraFraming(CAMERA_CONFIG);
	}

	/**
	 * Computes a stable player-composition target for current pose and viewport.
	 *
	 * @param {number} landingOffset Decaying presentation-only landing impulse.
	 * @param {number} aspect Current native camera aspect.
	 * @returns {Readonly<object>} Position, FOV, and normalized speed target facts.
	 */
	positionTarget(landingOffset, aspect) {
		const speedRatio = this.speedRatio();
		const wrapperX = this.runner.character.wrapper.position.x;
		const slideDip = this.runner.ducking
			? CAMERA_CONFIG.slideDip
			: 0;
		return Object.freeze({
			x: this.framing.lateralOffset(wrapperX),
			y: CAMERA_CONFIG.baseY
				+ this.framing.jumpOffset(this.runner.verticalY)
				- slideDip
				- landingOffset,
			z: this.framing.zTarget(speedRatio, aspect),
			fov: this.framing.fovTarget(speedRatio, aspect),
			speedRatio
		});
	}

	/** @returns {Readonly<object>} Euler XYZ presentation rotation. */
	rotationTarget() {
		const wrapperX = this.runner.character.wrapper.position.x;
		const laneRoll = clamp(
			-wrapperX * CAMERA_CONFIG.laneRollStrength,
			-CAMERA_CONFIG.maxRoll,
			CAMERA_CONFIG.maxRoll
		);
		const turnStrength = this.turnStrength();
		return Object.freeze({
			pitch: CAMERA_CONFIG.pitch,
			yaw: turnStrength * CAMERA_CONFIG.turnYaw,
			roll: clamp(
				laneRoll - turnStrength * CAMERA_CONFIG.turnRoll,
				-CAMERA_CONFIG.maxRoll,
				CAMERA_CONFIG.maxRoll
			),
			turnStrength
		});
	}

	/** @returns {number} Zero-to-one normalized speed intensity. */
	speedRatio() {
		const span = RUNNER_CONFIG.maxSpeed - RUNNER_CONFIG.startSpeed;
		return clamp(
			(this.state.speed - RUNNER_CONFIG.startSpeed) / span,
			0,
			1
		);
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
