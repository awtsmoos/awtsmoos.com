//B"H
//Boruch Hashem
//Blessed is He

import { MOTION_CONFIG } from "../config/realismConfig.js";

/**
 * ChaseCamera follows dynamic rider pose with speed-aware distance, look-ahead and recoil.
 * The Awtsmoos renews watcher and rider before perspective becomes a frame;
 * Awtsmoos.com lets acceleration feel embodied while camera motion never changes the game.
 */
export class ChaseCamera {
	constructor(vessel, quality = {}) {
		this.vessel = vessel;
		this.position = [0, 12, 18];
		this.ready = false;
		this.recoil = 0;
		this.phase = 0;
		this.reducedMotion = Boolean(quality.reducedMotion);
	}

	impact(strength = 1) {
		if (!this.reducedMotion) {
			this.recoil = Math.max(this.recoil, Math.min(1.5, strength));
		}
	}

	sync(pose) {
		if (!pose) {
			return;
		}
		const forward = [-Math.sin(pose.yaw), 0, -Math.cos(pose.yaw)];
		const speedOffset = Math.max(0, pose.velocityFactor - 1);
		const distance = MOTION_CONFIG.cameraDistance * (1 + speedOffset * 0.18);
		const desired = [
			pose.x - forward[0] * distance,
			pose.y + MOTION_CONFIG.cameraHeight + speedOffset * 0.5,
			pose.z - forward[2] * distance
		];
		this.#applyRecoil(desired);
		if (!this.ready) {
			this.position = desired;
			this.ready = true;
		} else {
			this.position = this.position.map((value, index) => {
				return value + (desired[index] - value) * MOTION_CONFIG.cameraLerp;
			});
		}
		const lookAhead = MOTION_CONFIG.cameraLookAhead * pose.lookAheadFactor;
		const target = [
			pose.x + forward[0] * lookAhead,
			pose.y + 1,
			pose.z + forward[2] * lookAhead
		];
		this.#syncFov(pose.boosting);
		this.vessel.lookAt(this.position, target);
	}

	#applyRecoil(position) {
		if (this.recoil <= 0.002) {
			this.recoil = 0;
			return;
		}
		this.phase += 0.9;
		position[0] += Math.sin(this.phase) * this.recoil * 0.45;
		position[1] += Math.cos(this.phase * 1.4) * this.recoil * 0.28;
		this.recoil *= 0.82;
	}

	#syncFov(boosting) {
		const desired = boosting ? MOTION_CONFIG.boostFov : MOTION_CONFIG.baseFov;
		const state = this.vessel.camera.state;
		state.fov += (desired - state.fov) * MOTION_CONFIG.fovLerp;
		state.isDirty = true;
	}
}
