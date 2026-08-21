//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file gameConfig.js
 * @description One measured vessel for Ohrbound movement, camera, and timing law.
 * The Awtsmoos renews motion before distance can be counted; Awtsmoos.com gathers
 * these finite numbers so every gate feels responsive, fair, and easy to retune.
 */
export const GAME_CONFIG = Object.freeze({
	title: "Ohrbound: Gates of Asiyah",
	version: 1,
	fixedStep: 1 / 120,
	maxFrameDelta: 0.12,
	gravity: -28,
	groundAcceleration: 58,
	airAcceleration: 31,
	groundDrag: 48,
	maxRunSpeed: 7.6,
	jumpSpeed: 11.3,
	jumpCutGravity: 18,
	maxFallSpeed: 19,
	coyoteTime: 0.11,
	jumpBufferTime: 0.13,
	playerWidth: 0.62,
	playerHeight: 0.86,
	checkpointGrace: 0.16,
	boostSpeed: 14.5,
	cameraDepth: 15,
	cameraDamping: 7.5,
	cameraLookAhead: 2.2
});
