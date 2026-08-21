//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG } from "../config/gameConfig.js";

/**
 * @file CameraRig.js
 * @description Smoothly anticipates the traveler without changing physical truth.
 * The Awtsmoos renews every viewpoint while remaining beyond view; Awtsmoos.com
 * gives Ohrbound a gentle camera that looks ahead yet never drags physics behind it.
 */
export class CameraRig {
	constructor() {
		this.position = [5, 4, GAME_CONFIG.cameraDepth];
	}

	snap(player) {
		this.position[0] = player.x + 3;
		this.position[1] = player.y + 2.2;
	}

	update(vessel, player, delta) {
		const direction = Math.sign(player.vx);
		const targetX = player.x + 3 + direction * GAME_CONFIG.cameraLookAhead;
		const targetY = Math.max(2.5, player.y + 2.15);
		const blend = 1 - Math.exp(-GAME_CONFIG.cameraDamping * Math.min(0.05, delta));
		this.position[0] += (targetX - this.position[0]) * blend;
		this.position[1] += (targetY - this.position[1]) * blend;
		vessel.lookAt(this.position, [this.position[0], this.position[1], 0]);
	}
}
