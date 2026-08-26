//B"H
//Boruch Hashem
//Blessed is He

import { MOTION_CONFIG } from "../config/realismConfig.js";

/**
 * ChaseCamera follows the enlarged-world rider through time-based smoothing, speed distance, look-ahead and recoil.
 * The Awtsmoos renews each measured moment so perspective need not depend on display refresh rate;
 * Awtsmoos.com lets thirty, sixty, or one hundred twenty frames reveal one coherent chase state.
 */
export class ChaseCamera {
	constructor(vessel, quality = {}) {
		this.vessel = vessel;
		this.position = [0, 12, 18];
		this.ready = false;
		this.recoil = 0;
		this.phase = 0;
		this.lastTime = null;
		this.reducedMotion = Boolean(quality.reducedMotion);
	}

	impact(strength = 1) {
		if (!this.reducedMotion) {
			this.recoil = Math.max(this.recoil, Math.min(1.5, strength));
		}
	}

	sync(pose, timeMs = 0) {
		if (!pose) {
			return;
		}
		const delta = this.#delta(timeMs);
		const forward = [-Math.sin(pose.yaw), 0, -Math.cos(pose.yaw)];
		const speedOffset = Math.max(0, pose.velocityFactor - 1);
		const distance = MOTION_CONFIG.cameraDistance * (1 + speedOffset * 0.2);
		const desired = [
			pose.x - forward[0] * distance,
			pose.y + MOTION_CONFIG.cameraHeight + speedOffset * 0.65,
			pose.z - forward[2] * distance
		];
		this.#applyRecoil(desired, delta);
		const blend = 1 - Math.exp(-MOTION_CONFIG.cameraResponse * delta);
		if (!this.ready) {
			this.position = desired;
			this.ready = true;
		} else {
			this.position = this.position.map((value, index) => value + (desired[index] - value) * blend);
		}
		const lookAhead = MOTION_CONFIG.cameraLookAhead * pose.lookAheadFactor;
		const target = [pose.x + forward[0] * lookAhead, pose.y + 1, pose.z + forward[2] * lookAhead];
		this.#syncFov(pose.boosting, delta);
		this.vessel.lookAt(this.position, target);
	}

	#delta(timeMs) {
		const time = Number(timeMs) || 0;
		const delta = this.lastTime === null ? 1 / 60 : Math.min(0.05, Math.max(0.001, (time - this.lastTime) / 1000));
		this.lastTime = time;
		return delta;
	}

	#applyRecoil(position, delta) {
		if (this.recoil <= 0.002) {
			this.recoil = 0;
			return;
		}
		this.phase += MOTION_CONFIG.recoilFrequency * delta;
		position[0] += Math.sin(this.phase) * this.recoil * 0.45;
		position[1] += Math.cos(this.phase * 1.4) * this.recoil * 0.28;
		this.recoil *= Math.exp(-MOTION_CONFIG.recoilDecay * delta);
	}

	#syncFov(boosting, delta) {
		const desired = boosting ? MOTION_CONFIG.boostFov : MOTION_CONFIG.baseFov;
		const blend = 1 - Math.exp(-MOTION_CONFIG.fovResponse * delta);
		const state = this.vessel.camera.state;
		state.fov += (desired - state.fov) * blend;
		state.isDirty = true;
	}
}
