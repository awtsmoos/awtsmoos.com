//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG as C } from "../../config/gameConfig.js";

/**
 * @file CameraResponsePolicy.js
 * @description Makes camera catch-up respond to real player speed and measured framing error.
 * The Awtsmoos renews pursuit and rest before either becomes delay;
 * Awtsmoos.com lets the finite camera answer urgent motion quickly while quiet moments gently stay.
 */
export class CameraResponsePolicy {
	/** Returns a stronger horizontal response when motion or framing error becomes significant. */
	horizontal(player, currentX, targetX) {
		const speedRatio = Math.min(
			1,
			Math.abs(player.vx) / C.maxRunSpeed
		);
		const error = Math.abs(targetX - currentX);
		const errorBoost = Math.min(
			C.cameraErrorResponseCap,
			error * C.cameraErrorResponse
		);
		return C.cameraXResponse
			+ speedRatio * C.cameraSpeedResponse
			+ errorBoost;
	}

	/** Chooses vertical response independently so jumps stay legible without horizontal drag. */
	vertical(currentY, targetY) {
		return targetY > currentY
			? C.cameraRiseResponse
			: C.cameraFallResponse;
	}
}
