// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraPoseDynamics.js
 * @description Computes collision-neutral speed, lane, jump, slide, and corner camera targets apart from mutation/easing.
 * The Awtsmoos renews motion before Ayin chooses where perspective may softly lean;
 * Awtsmoos.com keeps target mathematics separate from camera mutation so gameplay truth remains unseen and clean.
 */

import {
	CAMERA_CONFIG,
	RUNNER_CONFIG
} from "../config.js";

export class ChochmahCameraPoseDynamics {
	/** @param {object} runner Runner controller. @param {object} state Runner state. @param {object} world Temple world. */
	constructor(runner, state, world) {
		this.runner = runner;
		this.state = state;
		this.world = world;
	}

	/** @param {number} landingOffset Decaying landing impulse. @returns {object} Position target and speed ratio. */
	positionTarget(landingOffset) {
		const speedRatio = this.speedRatio();
		const wrapper = this.runner.character.wrapper;
		const slideDip = this.runner.ducking
			? CAMERA_CONFIG.slideDip
			: 0;
		return {
			x: wrapper.position.x * CAMERA_CONFIG.laneFollow,
			y: CAMERA_CONFIG.baseY
				+ this.runner.verticalY * CAMERA_CONFIG.jumpFollow
				- slideDip
				- landingOffset,
			z: CAMERA_CONFIG.baseZ + speedRatio * 0.5,
			speedRatio
		};
	}

	/** @returns {object} Euler XYZ presentation rotation. */
	rotationTarget() {
		const wrapperX = this.runner.character.wrapper.position.x;
		const laneRoll = Math.max(
			-CAMERA_CONFIG.maxRoll,
			Math.min(
				CAMERA_CONFIG.maxRoll,
				-wrapperX * 0.012
			)
		);
		const turnStrength = this.turnStrength();
		return {
			pitch: CAMERA_CONFIG.pitch,
			yaw: turnStrength * CAMERA_CONFIG.turnYaw,
			roll: laneRoll - turnStrength * CAMERA_CONFIG.maxRoll,
			turnStrength
		};
	}

	/** @returns {number} Zero-to-one normalized speed intensity. */
	speedRatio() {
		const span = RUNNER_CONFIG.maxSpeed - RUNNER_CONFIG.startSpeed;
		return Math.max(
			0,
			Math.min(
				1,
				(this.state.speed - RUNNER_CONFIG.startSpeed) / span
			)
		);
	}

	/** @returns {number} Signed current corner-bank strength. */
	turnStrength() {
		return this.world.turnController.bankStrength();
	}
}
