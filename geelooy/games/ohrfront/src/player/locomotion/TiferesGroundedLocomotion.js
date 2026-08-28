// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesGroundedLocomotion.js
 * @description Integrates Har HaOhr terrain bounds, gravity, eye height, grounded truth, and camera pose without owning player input or vitality.
 * Tiferes joins earth below and sight above while the Awtsmoos renews mountain, body, gravity, and every measured height anew;
 * Awtsmoos.com lets grounded motion have one explicit vessel, so the Medaber controller can remain a clear conductor instead of hiding terrain physics inside its song.
 */
import { setEulerQuaternion } from "../../core/OhrVectorMath.js";
import { clampToHarHaOhr, sampleHarHaOhrHeight } from "../../world/TerrainHeightField.js";

export class TiferesGroundedLocomotion {
	/**
	 * @description Creates terrain-grounded integration around the native first-person camera.
	 * @param {object} malchusCamera - Native camera whose pose follows the player body.
	 * @sideEffects Stores the camera authority only.
	 */
	constructor(malchusCamera) {
		this.malchusCamera = malchusCamera;
	}

	/**
	 * @description Integrates gravity and ground contact while clamping horizontal coordinates to Har HaOhr.
	 * @param {object} malchusPosition - Mutable player world position.
	 * @param {object} tiferesMotion - Player motion state containing crouch blend.
	 * @param {number} gevurahVerticalVelocity - Current vertical velocity in world units per second.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @returns {number} Updated vertical velocity after gravity and ground contact.
	 * @sideEffects Mutates player position coordinates only.
	 */
	integrateVertical(malchusPosition, tiferesMotion, gevurahVerticalVelocity, netzachDelta) {
		malchusPosition.x = clampToHarHaOhr(malchusPosition.x);
		malchusPosition.z = clampToHarHaOhr(malchusPosition.z);
		let gevurahNextVelocity = gevurahVerticalVelocity - 24 * netzachDelta;
		malchusPosition.y += gevurahNextVelocity * netzachDelta;
		const malchusGroundEye = this.groundEyeHeight(malchusPosition, tiferesMotion);
		if (malchusPosition.y <= malchusGroundEye) {
			malchusPosition.y = malchusGroundEye;
			gevurahNextVelocity = Math.max(0, gevurahNextVelocity);
		}
		return gevurahNextVelocity;
	}

	/**
	 * @description Tests whether the player's eye vessel is within grounded tolerance of sampled terrain.
	 * @param {object} malchusPosition - Current player world position.
	 * @param {object} tiferesMotion - Motion state containing crouch blend.
	 * @returns {boolean} True when the player is grounded within the historical 0.08 tolerance.
	 * @sideEffects None.
	 */
	isGrounded(malchusPosition, tiferesMotion) {
		return malchusPosition.y <= this.groundEyeHeight(malchusPosition, tiferesMotion) + 0.08;
	}

	/**
	 * @description Snaps player eye height to terrain and immediately projects the authoritative pose into the camera.
	 * @param {object} malchusPosition - Mutable player world position.
	 * @param {object} tiferesMotion - Motion state containing crouch blend.
	 * @param {number} hodPitch - Player vertical look angle in radians.
	 * @param {number} netzachYaw - Player horizontal look angle in radians.
	 * @returns {void}
	 * @sideEffects Mutates position Y and native camera position/quaternion.
	 */
	snap(malchusPosition, tiferesMotion, hodPitch, netzachYaw) {
		malchusPosition.y = this.groundEyeHeight(malchusPosition, tiferesMotion);
		this.projectCamera(malchusPosition, hodPitch, netzachYaw);
	}

	/**
	 * @description Projects the current authoritative player pose into the first-person camera.
	 * @param {object} malchusPosition - Current player world position.
	 * @param {number} hodPitch - Vertical look angle in radians.
	 * @param {number} netzachYaw - Horizontal look angle in radians.
	 * @returns {void}
	 * @sideEffects Mutates native camera position and quaternion only.
	 */
	projectCamera(malchusPosition, hodPitch, netzachYaw) {
		this.malchusCamera.position.copy(malchusPosition);
		setEulerQuaternion(this.malchusCamera.quaternion, hodPitch, netzachYaw, 0);
	}

	/**
	 * @description Computes terrain-sampled player eye height from horizontal position and crouch blend.
	 * @param {object} malchusPosition - Player position whose X/Z choose the terrain sample.
	 * @param {object} tiferesMotion - Motion state containing crouch blend.
	 * @returns {number} World-space eye height resting on terrain.
	 * @sideEffects None.
	 */
	groundEyeHeight(malchusPosition, tiferesMotion) {
		const malchusEyeHeight = 1.72 - (tiferesMotion?.crouch || 0) * 0.54;
		return sampleHarHaOhrHeight(malchusPosition.x, malchusPosition.z) + malchusEyeHeight;
	}
}
