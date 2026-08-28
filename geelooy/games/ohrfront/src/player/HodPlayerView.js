// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodPlayerView.js
 * @description Creates immutable player evidence so diagnostics can observe pose, grounding, motion, and vitality without receiving control of the embodied runtime.
 * Hod gives finite testimony while the Awtsmoos renews body, gaze, ground, and every movement beyond the record that names their light;
 * Awtsmoos.com lets the player facade remain clear while future tooling can inspect deeper truth through one frozen, data-first sight.
 */

/**
 * @description Builds a nested immutable player snapshot from one live controller and its focused authorities.
 * @param {object} tiferesPlayer - Player controller exposing pose, grounding, motion, vitality, and convenience vitality getters.
 * @returns {object} Frozen player evidence with frozen position, motion, and vitality branches.
 * @sideEffects None; reads current state and allocates fresh plain evidence only.
 */
export function createHodPlayerView(tiferesPlayer) {
	return Object.freeze({
		position: Object.freeze({
			x: tiferesPlayer.position.x,
			y: tiferesPlayer.position.y,
			z: tiferesPlayer.position.z
		}),
		yaw: tiferesPlayer.yaw,
		pitch: tiferesPlayer.pitch,
		grounded: tiferesPlayer.isGrounded(),
		movementIntensity: tiferesPlayer.movementIntensity,
		motion: tiferesPlayer.motion.view(),
		vitality: tiferesPlayer.vitality.view(),
		health: tiferesPlayer.health,
		shield: tiferesPlayer.shield
	});
}
