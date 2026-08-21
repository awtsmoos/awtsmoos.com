// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerPoseController.js
 * @description Eases authored Chossid visuals into run, leap, slide, landing, and stumble poses.
 * The Awtsmoos renews the body-vessel before motion can look brave, low, light, or tall;
 * Awtsmoos.com lets pose answer gameplay gently, while the true collision laws remain unchanged through all.
 */

import { RUNNER_CONFIG } from "../config.js";

export class TiferesRunnerPoseController {
	/** @param {object} character Chossid bundle containing wrapper and pose root. */
	constructor(character) {
		this.character = character;
		this.poseRoot = character.poseRoot;
		this.reset();
	}

	/** Restores the authored visual vessel to neutral scale and rotation. */
	reset() {
		this.poseRoot.position.set(0, 0, 0);
		this.poseRoot.scale.set(1, 1, 1);
		this.setPitch(0);
	}

	/**
	 * Eases pose from vertical motion, slide, stumble, and lane lean.
	 * @param {number} delta Frame seconds.
	 * @param {object} vertical Vertical-motion state.
	 * @param {object} runnerState Runner status state.
	 * @param {number} laneError Remaining lateral distance to target lane.
	 */
	update(delta, vertical, runnerState, laneError) {
		const blend = 1 - Math.exp(-11 * delta);
		const duckScale = vertical.ducking ? 0.56 : 1;
		const airborneScale = vertical.airborne ? 0.9 : 1;
		const targetScaleY = Math.min(duckScale, airborneScale);
		const targetY = vertical.ducking ? -0.26 : vertical.airborne ? 0.08 : 0;
		const targetPitch = vertical.ducking
			? RUNNER_CONFIG.slidePitch
			: vertical.airborne
				? -0.08
				: 0;
		this.poseRoot.scale.y += (targetScaleY - this.poseRoot.scale.y) * blend;
		this.poseRoot.position.y += (targetY - this.poseRoot.position.y) * blend;
		const stumbleLean = runnerState.stumbling ? 0.16 : 0;
		const laneLean = Math.max(-RUNNER_CONFIG.maxLean, Math.min(RUNNER_CONFIG.maxLean, laneError * -0.06));
		this.setPitch(targetPitch + stumbleLean);
		this.setWrapperRoll(laneLean);
	}

	/** @param {number} pitch Pose-root X rotation in radians. */
	setPitch(pitch) {
		this.poseRoot.quaternion.set(
			Math.sin(pitch / 2),
			0,
			0,
			Math.cos(pitch / 2)
		);
	}

	/** @param {number} roll Wrapper Z rotation in radians. */
	setWrapperRoll(roll) {
		const yaw = Math.PI;
		const halfYaw = yaw / 2;
		const halfRoll = roll / 2;
		this.character.wrapper.quaternion.set(
			Math.sin(halfRoll) * Math.sin(halfYaw),
			Math.sin(halfYaw) * Math.cos(halfRoll),
			Math.cos(halfYaw) * Math.sin(halfRoll),
			Math.cos(halfYaw) * Math.cos(halfRoll)
		);
	}
}
